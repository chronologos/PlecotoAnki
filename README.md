# Pleco to Anki sync

To use:
- Install the AnkiConnect add-on for Anki (one-time)
- Install and set up nodejs (one-time)
- Export flashcards from Pleco. 
  - See [screenshot](./export_config.PNG) for how to configure the export options
  - Transfer the file from your phone to your computer. e.g. to ~/Desktop/flash.txt 
- Build js: `npm run build`
- Run js: `npm run run -- ~/Desktop/flash.txt`

The code expects the following to exist in Anki:
- A deck called "Max Infinity"
- A note type "Chinese" with fields: english, chinese, pinyin, extra

Code does a query to ensure that duplicate cards are not created if the same file is imported again. This doesn't work if the cards are edited in Anki.