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
- 📸 **The plates** — 39 photographs in their own appendix chapter, with no
  captions at all, grouped by the part of the wait they belong to; full size on
  tap, arrows and Escape on a keyboard.
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
   extension works, the player tries `.m4a` first and then `.mp3`. What ships now
   is AAC 128 kbps with `faststart` (3.1 MB and 3.7 MB, from 8.8 and 10.6 MB),
   which starts playing without waiting for the whole file:
   ```
   audio/admv.m4a
   audio/perdonar-y-agradecer.m4a
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

### The photographs live in their own chapter

No photograph carries a caption anymore. The story is text; the photographs are
in **chapter VI — The plates**, grouped by the part of the wait they belong to
and in the order they arrived. A group label can be wrong, but a group label
does not sit on top of one photograph pretending to describe it, so there is no
`photo ↔ caption` pairing left to get wrong.

The only thing left to decide is which group each photograph is in, and that
lives in **one place**: `GRUPOS` in `tools/fotos.py`.

```python
('The wait', 'the part nobody photographs', [
    'memoria1.jpg',
    'memoria2.jpg',
    ...
]),
```

From that table, one command writes both things:

```
python3 tools/fotos.py
```

- rewrites the gallery inside `index.html`, between the `FOTOS:inicio` and
  `FOTOS:fin` markers, with srcset and `data-full` already built — and if
  nothing changed in the table the file comes out byte for byte identical;
- builds **`revisar.html`**, a local page with every photograph, its file name
  and a dropdown to move it to another group. It is gitignored and never
  published.

When you add a photograph: run `python3 tools/webp.py`, add its line to a group
in the table, and run `python3 tools/fotos.py`.

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
- `tools/fotos.py` — the photograph/group table, and the script that writes the
  gallery into `index.html` and builds `revisar.html`.
- `tools/revisar.plantilla.html` — the shell of the review page.
- `robots.txt` — keeps search engines out.
