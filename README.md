# Pleco to Anki sync

To use:
- export flashcards from Pleco. e.g. to ~/Desktop/flash.txt (see screenshot for how to configure the export options)
- build js: `npm run build`
- run js: `node index.js ~/Desktop/flash.txt`

The code expects the following to exist in Anki:
- A deck called "Max Infinity"
- A note type "Chinese" with fields: english, chinese, pinyin, extra

Code does a query to ensure that duplicate cards are not created if the same file is imported again. This doesn't work if the cards are edited in Anki.