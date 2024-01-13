"use strict";

// Initializin of the variable for instance of asdasd
let blockchain;

function init_asdasd(asdasd) {
  if (indexedDB instanceof IDBFactory) {
    // Supports indexedDB

		// Initializing of asdasd
    blockchain = new asdasd(
      "test",
      (text, settings, previous, created) => {
        let hash = "";
        let nonce = 0;

        do {
          hash = nobleHashes.utils.bytesToHex(nobleHashes.blake3(
            previous + text + created + ++nonce,
            settings,
          ));
        } while (hash.substring(0, 3) !== "000");

        return { nonce, hash };
      },
    );
  } else {
    // Not supports indexed

    // Show the error
    document.getElementsByTagName("main")[0].innerText =
      "Your browser does not support indexedDB which is used for asdasd blockchain";
  }
}

if (typeof window.asdasd === "function") (() => init_asdasd(asdasd))();
else {document.addEventListener("asdasd.initialized", (e) =>
    init_asdasd(e.asdasd));}
