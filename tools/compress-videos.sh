#!/usr/bin/env bash
# Interactive video compressor.
#
# Drop this script in a folder of videos and run it:
#   ./compress-videos.sh            # uses the folder the script is in
#   ./compress-videos.sh <folder>   # or point it at another folder
#
# Pick a video, a resolution, a format and audio on/off (arrow keys or type the number, Enter
# to confirm). Output goes to "<folder>/compressed/<name>-compressed-<res>.<ext>"
# (plus -hevc / -av1 / -muted when those options are picked).
#
# Sizes are estimated from a fixed bitrate per resolution and codec, and the
# encode is two-pass at that bitrate, so the result lands close to the estimate.
#
# Needs: ffmpeg + ffprobe, bash 4+.

set -uo pipefail
MUTE=0

# ---------------------------------------------------------------- settings ---

# Video bitrate (kbit/s) for H.264 at ~30fps, by the short side of the frame.
# Other codecs get a fraction of this (see CODEC_FACTOR).
declare -A LADDER=(
  [2160]=14000 [1440]=8000 [1080]=4500 [720]=2500
  [540]=1500   [480]=1100  [360]=700   [240]=400
)
HEIGHTS=(2160 1440 1080 720 540 480 360 240)

# How much bitrate each codec needs for roughly the same quality as H.264.
declare -A CODEC_FACTOR=([h264]=100 [hevc]=60 [vp9]=60 [av1]=45)

# ------------------------------------------------------------------ setup ----

if ! command -v ffmpeg >/dev/null || ! command -v ffprobe >/dev/null; then
  echo "ffmpeg and ffprobe are required (sudo apt install ffmpeg)." >&2
  exit 1
fi

self=$(readlink -f "$0")
dir=${1:-$(dirname "$self")}
cd "$dir" || exit 1
out_dir="$dir/compressed"

tmp=$(mktemp -d)
partial=""
cleanup() {
  tput cnorm 2>/dev/null
  [[ -n $partial && -f $partial ]] && rm -f "$partial"
  rm -rf "$tmp"
}
trap cleanup EXIT
trap 'echo; echo "Cancelled."; exit 130' INT

bold=$'\e[1m' dim=$'\e[2m' rev=$'\e[7m' green=$'\e[32m' yellow=$'\e[33m' reset=$'\e[0m'

# ---------------------------------------------------------------- helpers ----

# Arrow-key / number menu. Usage: menu "Title" option... ; result in $CHOICE (0-based).
menu() {
  local title=$1; shift
  local opts=("$@") n=$# sel=0 typed="" key rest i
  printf '\n%s%s%s  %s(↑↓ / number, Enter, q quits)%s\n' "$bold" "$title" "$reset" "$dim" "$reset"
  tput civis 2>/dev/null
  # Every line is cut to fit the terminal width. A wrapped line takes two rows,
  # which breaks the "move up n rows and redraw" trick below.
  draw_menu() {
    local cols max text
    cols=$(stty size </dev/tty 2>/dev/null); cols=${cols#* }; [[ $cols =~ ^[0-9]+$ ]] || cols=80
    max=$(( cols - 9 ))  # "  > 12) " prefix plus one spare column
    (( max < 10 )) && max=10
    for i in "${!opts[@]}"; do
      text=${opts[i]}
      (( ${#text} > max )) && text="${text:0:max-1}…"
      if (( i == sel )); then
        printf '\r\e[2K%s  > %2d) %s%s\n' "$rev" $((i + 1)) "$text" "$reset"
      else
        printf '\r\e[2K    %2d) %s\n' $((i + 1)) "$text"
      fi
    done
  }
  draw_menu
  while true; do
    IFS= read -rsn1 key
    case $key in
      $'\e')
        read -rsn2 -t 0.05 rest
        case $rest in
          '[A'|'OA') sel=$(( (sel - 1 + n) % n )) ;;
          '[B'|'OB') sel=$(( (sel + 1) % n )) ;;
        esac
        typed="" ;;
      k) sel=$(( (sel - 1 + n) % n )); typed="" ;;
      j) sel=$(( (sel + 1) % n )); typed="" ;;
      [0-9])
        typed+=$key
        if (( 10#$typed >= 1 && 10#$typed <= n )); then sel=$(( 10#$typed - 1 )); else typed=$key; (( 10#$typed >= 1 && 10#$typed <= n )) && sel=$(( 10#$typed - 1 )); fi ;;
      q|Q) tput cnorm 2>/dev/null; echo "Bye."; exit 0 ;;
      '') break ;;
    esac
    printf '\e[%dA' "$n"
    draw_menu
  done
  tput cnorm 2>/dev/null
  CHOICE=$sel
}

human_size() { # bytes -> "12.3 MB"
  awk -v b="$1" 'BEGIN {
    split("B KB MB GB TB", u); i = 1
    while (b >= 1024 && i < 5) { b /= 1024; i++ }
    printf (i <= 2 ? "%.0f %s" : "%.1f %s"), b, u[i]
  }'
}

human_time() { # seconds -> "m:ss" or "h:mm:ss"
  local s=${1%.*}
  if (( s >= 3600 )); then printf '%d:%02d:%02d' $((s / 3600)) $((s % 3600 / 60)) $((s % 60))
  else printf '%d:%02d' $((s / 60)) $((s % 60)); fi
}

# Fill VIDEO_* globals for a file. Returns 1 if it is not a usable video.
probe() {
  local f=$1 k v
  VIDEO_W=0 VIDEO_H=0 VIDEO_FPS=30 VIDEO_VBR=0 VIDEO_DUR=0 VIDEO_ACH=0
  while IFS='=' read -r k v; do
    case $k in
      width) VIDEO_W=$v ;;
      height) VIDEO_H=$v ;;
      avg_frame_rate) [[ $v == */* && ${v#*/} != 0 ]] && VIDEO_FPS=$(( ${v%/*} / ${v#*/} )) ;;
      bit_rate) [[ $v =~ ^[0-9]+$ ]] && VIDEO_VBR=$(( v / 1000 )) ;;
    esac
  done < <(ffprobe -v error -select_streams v:0 -show_entries stream=width,height,avg_frame_rate,bit_rate -of default=nw=1 "$f" 2>/dev/null)
  (( VIDEO_W > 0 && VIDEO_H > 0 )) || return 1

  VIDEO_DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f" 2>/dev/null)
  [[ $VIDEO_DUR =~ ^[0-9.]+$ ]] || return 1          # images have no duration
  awk -v d="$VIDEO_DUR" 'BEGIN { exit !(d > 0.5) }' || return 1

  VIDEO_ACH=$(ffprobe -v error -select_streams a:0 -show_entries stream=channels -of csv=p=0 "$f" 2>/dev/null)
  [[ $VIDEO_ACH =~ ^[0-9]+$ ]] || VIDEO_ACH=0

  # Some containers do not report a per-stream bitrate; fall back to the overall one.
  if (( VIDEO_VBR == 0 )); then
    v=$(ffprobe -v error -show_entries format=bit_rate -of csv=p=0 "$f" 2>/dev/null)
    [[ $v =~ ^[0-9]+$ ]] && VIDEO_VBR=$(( v / 1000 ))
  fi
  return 0
}

# Video kbit/s for a short-side height + codec, scaled for frame rate and
# capped below the source bitrate (re-encoding higher than the source is pointless).
video_kbps() {
  local h=$1 codec=$2 base k
  base=${LADDER[$h]:-}
  if [[ -z $base ]]; then  # non-standard source height: interpolate by pixel count
    base=$(awk -v h="$h" 'BEGIN { printf "%d", 4500 * (h * h) / (1080 * 1080) }')
  fi
  k=$(( base * CODEC_FACTOR[$codec] / 100 ))
  (( VIDEO_FPS > 40 )) && k=$(( k * 14 / 10 ))
  (( k < 100 )) && k=100
  if (( VIDEO_VBR > 0 && k > VIDEO_VBR * 9 / 10 )); then k=$(( VIDEO_VBR * 9 / 10 )); fi
  (( k < 20 )) && k=20
  echo "$k"
}

audio_kbps() { # codec -> kbit/s (0 if the file has no audio)
  (( VIDEO_ACH == 0 || MUTE )) && { echo 0; return; }
  case $1 in vp9) echo 96 ;; *) echo 128 ;; esac
}

estimate_bytes() { # height codec -> bytes
  local v a
  v=$(video_kbps "$1" "$2"); a=$(audio_kbps "$2")
  awk -v v="$v" -v a="$a" -v d="$VIDEO_DUR" 'BEGIN { printf "%d", (v + a) * 1000 / 8 * d * 1.01 }'
}

# Run ffmpeg with a one-line progress bar. Usage: run_ffmpeg "label" ffmpeg-args...
run_ffmpeg() {
  local label=$1; shift
  local total_us k v pct bar width=30 filled
  total_us=$(awk -v d="$VIDEO_DUR" 'BEGIN { printf "%d", d * 1000000 }')
  ffmpeg -hide_banner -loglevel error -nostdin -y -nostats -progress pipe:1 "$@" 2>"$tmp/err" |
    while IFS='=' read -r k v; do
      [[ $k == out_time_us && $v =~ ^[0-9]+$ ]] || continue
      pct=$(( v * 100 / total_us )); (( pct > 100 )) && pct=100
      filled=$(( pct * width / 100 ))
      printf -v bar '%*s' "$filled" ''; bar=${bar// /#}
      printf '\r\e[2K  %-10s [%-*s] %3d%%' "$label" "$width" "$bar" "$pct"
    done
  local status=${PIPESTATUS[0]}
  if (( status == 0 )); then
    printf '\r\e[2K  %-10s [%s] 100%%\n' "$label" "$(printf '%*s' "$width" '' | tr ' ' '#')"
  else
    printf '\n'; echo "ffmpeg failed:" >&2; cat "$tmp/err" >&2
  fi
  return "$status"
}

# ------------------------------------------------------------ find videos ----

echo "${bold}Scanning $dir ...${reset}"
files=() labels=()
for f in *; do
  [[ -f $f && $(readlink -f "$f") != "$self" ]] || continue
  probe "$f" || continue
  files+=("$f")
  labels+=("$(printf '%-36s %9s  %5s  %dx%d' "${f:0:36}" "$(human_size "$(stat -L -c %s "$f")")" "$(human_time "$VIDEO_DUR")" "$VIDEO_W" "$VIDEO_H")")
done

if (( ${#files[@]} == 0 )); then
  echo "No video files found in $dir"
  exit 1
fi

# Which formats this ffmpeg can actually produce.
encoders=$(ffmpeg -hide_banner -encoders 2>/dev/null)
has() { grep -q " $1 " <<<"$encoders"; }
formats=() format_names=()
has libx264    && { formats+=(h264); format_names+=("MP4   H.264  plays everywhere"); }
has libx265    && { formats+=(hevc); format_names+=("MP4   H.265  ~40% smaller, Safari + most browsers"); }
has libvpx-vp9 && has libopus && { formats+=(vp9); format_names+=("WebM  VP9    ~40% smaller, all modern browsers"); }
if has libsvtav1; then av1_enc=libsvtav1; elif has libaom-av1; then av1_enc=libaom-av1; else av1_enc=""; fi
[[ -n $av1_enc ]] && { formats+=(av1); format_names+=("MP4   AV1    ~55% smaller, modern browsers, slow"); }

declare -A SHORT=([h264]=mp4 [hevc]=hevc [vp9]=webm [av1]=av1)
declare -A EXT=([h264]=mp4 [hevc]=mp4 [vp9]=webm [av1]=mp4)
declare -A SUFFIX=([h264]="" [hevc]="-hevc" [vp9]="" [av1]="-av1")  # keeps the MP4 variants apart

# ------------------------------------------------------------------ loop -----

while true; do
  menu "Select a video" "${labels[@]}"
  input=${files[CHOICE]}
  probe "$input"
  src_bytes=$(stat -L -c %s "$input")
  short=$(( VIDEO_W < VIDEO_H ? VIDEO_W : VIDEO_H ))
  portrait=$(( VIDEO_H > VIDEO_W ))

  # Resolutions at or below the source, plus the source itself if it is non-standard.
  res_list=()
  [[ -z ${LADDER[$short]:-} ]] && res_list+=("$short")
  for h in "${HEIGHTS[@]}"; do (( h <= short )) && res_list+=("$h"); done

  res_labels=()
  for h in "${res_list[@]}"; do
    line=$(printf '%5sp%s' "$h" "$( (( h == short )) && echo '*' || echo ' ')")
    for c in "${formats[@]}"; do
      line+=$(printf '  %-4s %-8s' "${SHORT[$c]}" "$(human_size "$(estimate_bytes "$h" "$c")")")
    done
    res_labels+=("$line")
  done
  printf '\n%s%s%s  %s, %s, %dx%d @ %dfps\n' "$bold" "$input" "$reset" "$(human_size "$src_bytes")" "$(human_time "$VIDEO_DUR")" "$VIDEO_W" "$VIDEO_H" "$VIDEO_FPS"
  menu "Select a resolution (* = original, estimated sizes)" "${res_labels[@]}"
  res=${res_list[CHOICE]}

  fmt_labels=()
  for i in "${!formats[@]}"; do
    fmt_labels+=("$(printf '%-48s ~%s' "${format_names[i]}" "$(human_size "$(estimate_bytes "$res" "${formats[i]}")")")")
  done
  menu "Select a format (${res}p)" "${fmt_labels[@]}"
  codec=${formats[CHOICE]}

  # Audio on/off (only asked when the video has an audio track).
  MUTE=0
  if (( VIDEO_ACH > 0 )); then
    with=$(human_size "$(estimate_bytes "$res" "$codec")")
    MUTE=1; without=$(human_size "$(estimate_bytes "$res" "$codec")"); MUTE=0
    menu "Audio" "Keep audio     ~$with" "Remove audio   ~$without  (muted)"
    MUTE=$CHOICE
  fi
  muted_suffix=""; (( MUTE )) && muted_suffix="-muted"

  vk=$(video_kbps "$res" "$codec")
  ak=$(audio_kbps "$codec")
  name=${input%.*}; [[ $name == "$input" || -z $name ]] && name=$input
  mkdir -p "$out_dir"
  output="$out_dir/${name}-compressed-${res}p${SUFFIX[$codec]}${muted_suffix}.${EXT[$codec]}"

  echo
  echo "  Input   $input ($(human_size "$src_bytes"))"
  echo "  Output  compressed/$(basename "$output")"
  echo "  Video   ${res}p, ${codec}, ${vk} kbit/s     Audio  $( (( ak > 0 )) && echo "${ak} kbit/s" || echo none)"
  echo "  Est.    ~$(human_size "$(estimate_bytes "$res" "$codec")")"
  [[ $codec == av1 && $av1_enc == libaom-av1 ]] && echo "  ${yellow}AV1 (libaom) is slow: expect several minutes per minute of video.${reset}"
  [[ -f $output ]] && echo "  ${yellow}This file exists and will be overwritten.${reset}"
  read -rp "  Start? [Y/n] " yn
  if [[ ! $yn =~ ^([yY]|)$ ]]; then echo "  Skipped."; else

    if (( portrait )); then scale="scale=${res}:-2"; else scale="scale=-2:${res}"; fi
    vf=(-vf "${scale}:flags=lanczos,format=yuv420p")
    maps=(-map 0:v:0 -sn -dn -map_chapters -1)
    audio=(-an)
    if (( ak > 0 )); then
      ach=$(( VIDEO_ACH > 2 ? 2 : VIDEO_ACH ))
      if [[ $codec == vp9 ]]; then audio=(-map 0:a:0 -c:a libopus -b:a "${ak}k" -ac "$ach")
      else audio=(-map 0:a:0 -c:a aac -b:a "${ak}k" -ac "$ach"); fi
    fi
    mp4=(); [[ ${EXT[$codec]} == mp4 ]] && mp4=(-movflags +faststart -write_tmcd 0)
    log="$tmp/pass"
    partial=$output
    ok=1

    case $codec in
      h264)
        v=(-c:v libx264 -preset slow -profile:v high -b:v "${vk}k" -passlogfile "$log")
        run_ffmpeg "pass 1/2" -i "$input" "${maps[@]}" "${vf[@]}" "${v[@]}" -pass 1 -an -f null /dev/null &&
        run_ffmpeg "pass 2/2" -i "$input" "${maps[@]}" "${vf[@]}" "${v[@]}" -pass 2 "${audio[@]}" "${mp4[@]}" "$output" || ok=0 ;;
      hevc)
        v=(-c:v libx265 -preset medium -b:v "${vk}k" -tag:v hvc1)
        run_ffmpeg "pass 1/2" -i "$input" "${maps[@]}" "${vf[@]}" "${v[@]}" -x265-params "pass=1:stats=$log.x265:log-level=error" -an -f null /dev/null &&
        run_ffmpeg "pass 2/2" -i "$input" "${maps[@]}" "${vf[@]}" "${v[@]}" -x265-params "pass=2:stats=$log.x265:log-level=error" "${audio[@]}" "${mp4[@]}" "$output" || ok=0 ;;
      vp9)
        v=(-c:v libvpx-vp9 -b:v "${vk}k" -deadline good -row-mt 1 -tile-columns 2 -passlogfile "$log")
        run_ffmpeg "pass 1/2" -i "$input" "${maps[@]}" "${vf[@]}" "${v[@]}" -cpu-used 4 -pass 1 -an -f null /dev/null &&
        run_ffmpeg "pass 2/2" -i "$input" "${maps[@]}" "${vf[@]}" "${v[@]}" -cpu-used 2 -pass 2 "${audio[@]}" "$output" || ok=0 ;;
      av1)
        if [[ $av1_enc == libsvtav1 ]]; then
          run_ffmpeg "encoding" -i "$input" "${maps[@]}" "${vf[@]}" -c:v libsvtav1 -preset 8 -b:v "${vk}k" "${audio[@]}" "${mp4[@]}" "$output" || ok=0
        else
          v=(-c:v libaom-av1 -b:v "${vk}k" -cpu-used 6 -row-mt 1 -tiles 2x2 -passlogfile "$log")
          run_ffmpeg "pass 1/2" -i "$input" "${maps[@]}" "${vf[@]}" "${v[@]}" -pass 1 -an -f null /dev/null &&
          run_ffmpeg "pass 2/2" -i "$input" "${maps[@]}" "${vf[@]}" "${v[@]}" -pass 2 "${audio[@]}" "${mp4[@]}" "$output" || ok=0
        fi ;;
    esac
    rm -f "$log"*

    if (( ok )); then
      partial=""
      out_bytes=$(stat -L -c %s "$output")
      if (( out_bytes < src_bytes )); then
        change="$(awk -v a="$src_bytes" -v b="$out_bytes" 'BEGIN { printf "%.1f", 100 - b * 100 / a }')% smaller"
      else
        change="${yellow}bigger than the source, which is already well compressed${reset}"
      fi
      echo "  ${green}Done:${reset} $(human_size "$src_bytes") -> ${bold}$(human_size "$out_bytes")${reset} (${change})"
      echo "  $output"
    else
      rm -f "$output"; partial=""
      echo "  Compression failed."
    fi
  fi

  echo
  read -rp "Compress another video? [Y/n] " again
  [[ $again =~ ^([yY]|)$ ]] || break
done
