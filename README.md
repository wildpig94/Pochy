# 💜 For Pocha — the archive

A private archive of us, for Carmen ("Pocha"), from Pocho (Alexis). Five chapters
of a long-distance story between Mexico 🇲🇽 and Canada 🇨🇦, behind a password gate,
and one page at the end that is hers to write.

Published with GitHub Pages at `https://wildpig94.github.io/Pochy/`.
The password is the four letters on her ring.

## ✨ What's inside

- 🔒 **Password gate** — only she gets in.
- ⏱️ **Live numbers** — months together and the countdown to the door, both
  computed from the real date, so nothing here goes stale.
- 📖 **Five chapters** — opened one at a time from the contents list.
- ⭐ **Under the same sky** — animated starfield with shooting stars.
- 💍 **The ring** — the T.O.K.Y. promise, one letter at a time.
- 🙈 **Hidden texts** — words in the story, a moon and two sparkles open a photo
  and a note.
- 📸 **Photographs** — 39 plates with captions, full size on tap, arrows and
  Escape on a keyboard.
- ♫ **Two songs** with lyrics timed to the audio.
- 🎟️ **Five coupons** and a **print room** to make her own sheet.
- 🦎 **The axolotl** — a small mascot in the corner. It talks when tapped, and it
  knows what has been read and what is still waiting.
- ✍️ **Her page** — the last chapter is empty; what she writes is kept in her
  phone and can be sent back with one tap.
- 🤫 **10-minute secret** — a toast that only shows up if she stays that long.

## ⚠️ Two dates to confirm

They live at the top of the script in `index.html`, inside `CONFIG`:

```js
var CONFIG={
  togetherSince:'2026-05-27',   // el día en que empezó todo
  door:'2026-11-06'             // la fecha de la puerta
};
```

`door` comes from the old countdown ("November 6 — the next time I get to hold
you"); `togetherSince` is May 26, confirmed. Change either line and everything
that counts days fixes itself. Both work in the past too — after the date, the masthead says
*"open · N days"* instead of counting down.

## ♫ Music

Two songs, two sources:

1. If the file exists in `audio/`, it plays from there — no ads, no data, and the
   lyrics stay in sync because they are timed against the audio itself. Either
   extension works, the player tries `.m4a` first and then `.mp3`:
   ```
   audio/admv.m4a            audio/admv.mp3
   audio/perdonar-y-agradecer.m4a    audio/perdonar-y-agradecer.mp3
   ```
2. If the file is missing, that song falls back to the YouTube player on its own.
3. `?source=yt` on the URL forces YouTube even when the files are there.

The lyrics are timed against the studio cuts. The files in `audio/` are the live
and study-session versions, so a song whose intro runs longer will start its
lyrics a little late or early — that is what `offset` is for, in seconds, per
song:

```js
{name:'ADMV',who:'Maluma',yt:'wo7PBOCie9w',file:'audio/admv',offset:0},
```

Positive numbers delay the lyrics. Check the first thirty seconds by ear; if the
highlight lands on the wrong line, nudge it. The YouTube player ignores `offset`.

## 📸 Photographs

Originals live in **`fotos/`**; `memoria1` … `memoria26` are the timeline,
`nueva01` … `nueva14` the newer ones, `cap4-1` … `cap4-8` the last chapter, and
`nuestra-primera-foto.jpg` the one in the ring reveal.

The page never loads those originals while reading. It loads the light versions in
**`fotos/web/`** (480 px and 900 px WebP) and only reaches for the original when a
photo is opened full size or printed. That is 10.8 MB → 1.9 MB.

When you add or replace a photo in `fotos/`, run:

```
python3 tools/webp.py
```

Then add the `<figure class="plate">` line in `index.html` the way the others are
written: `srcset` and `data-full` are what keep it light and sharp.

## 🦎 The axolotl

Lives at the bottom left, fixed, so it never covers text. It blinks, breathes, and
when tapped says something about what is still unread. It lifts a small heart when
a hidden text is found, and it hides when printing.

## ✍️ Her page

Chapter V. It autosaves to `localStorage` as she types ("saved in this phone"),
shows what she left on a previous day above the empty box, and **Send it to me**
opens the share sheet (or WhatsApp) with the text already written. Nothing leaves
her phone until she presses send.

## 🧠 What the page remembers

`localStorage`, key `pochy-archive-v1`: chapters opened, plates opened, hidden
texts found, her page, first and last visit. The masthead reads `3 of 5 chapters ·
12 of 39 photographs · 2 of 7 hidden things`, and a returning visit gets a
different opening line. Clearing browser data resets all of it.

## 🚀 Publish (GitHub Pages)

```
git add .
git commit -m "Update"
git push
```

GitHub Pages rebuilds in 1–2 minutes.

## 🗂️ Files

- `index.html` — the site. Everything is in this one file.
- `nueva.html` — an old copy (before the blue/purple/black version). Safe to delete.
- `original.html` — the very first version, kept for reference.
- `fotos/` — originals. `fotos/web/` — the light versions.
- `audio/` — put the two songs here.
- `tools/webp.py` — rebuilds `fotos/web/`.
- `robots.txt` — keeps search engines out.
