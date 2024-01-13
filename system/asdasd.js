"use strict";

if (typeof window.asdasd !== "function") {
  // Not initialized

  // Initializing of the class in global namespace
  window.asdasd = class asdasd {
    // Name of the database in IndexDB
    name;

    // Instance of the database session
    db;

    /**
     * Function for generating hash (BLAKE3)
     *
     * @param {string} text Text of message
     * @param {object} settings Settings for generating hash
     * @param {string} previous Hash of the previout message in the chain
     * @param {string} created Date of message creation (unixtime)
     *
     * @return {string} Symmetric hash
     */
    static blake3;

    constructor(name, blake3) {
      // Reinitializing Blake3
      if (typeof blake3 === "function") this.blake3 = blake3;

      if (typeof name === "string" && typeof this.blake3 === "function") {
        // Received name of the the database and implementation of BLAKE3

        // Write name of the the database to property
        this.name = name;

        // Send request to the database
        const request = indexedDB.open(this.name, 1);

        // Listening: "upgradeneeded"
        request.addEventListener("upgradeneeded", (e) => {
          // Write response to property
          this.db = e.target.result;

          // Initializing of instance of messages table in the database
          const messages = this.db.createObjectStore("messages", {
            keyPath: "id",
          });

          // Index: text
          messages.createIndex("text", "text", { unique: false });

          // Index: date of creation
          messages.createIndex("created", "created", { unique: false });

          // Index: hash
          messages.createIndex("hash", "hash", { unique: true });

          // Dispatch event: "initialized"
          document.dispatchEvent(
            new CustomEvent(`asdasd.${this.name}.initialized`),
          );
        });

        // Listening: "error"
        request.addEventListener(
          "error",
          (e) => alert("the database: " + e.target.error),
        );

        // Listening: "success"
        request.addEventListener("success", (e) => this.db = e.target.result);

        this.pending = [];
      }
    }

    /**
     * Count the number of messages in the database
     */
    count() {
      return new Promise((resolve, reject) => {
        // Initializing of transaction to the database
        const transaction = this.db.transaction(["messages"]);

        // Initializing of table in the database
        const messages = transaction.objectStore("messages");

        // Send request to the database
        const request = messages.count();

        // Listening: "error"
        request.addEventListener("error", (e) => reject(e));

        // Listening: "success"
        request.addEventListener("success", (e) => resolve(e.target.result));
      });
    }

    write(message) {
      return new Promise((resolve, reject) => {
        this.count().then(
          (amount) => {
            this.last().then(
              (last) => {
                // Initializing of transaction to the database
                const transaction = this.db.transaction(
                  ["messages"],
                  "readwrite",
                );

                // Initializing of table in the database
                const messages = transaction.objectStore("messages");

                // Initializing of the previous message in the chain hash
                const previous = last.hash ?? "popa";

                // Initializing of message creating date
                const created = Date.now();

                // Generate a hash of the message
                const generated = this.blake3(
                  message,
                  {
                    dkLen: Math.ceil(message.length / 64) * 64,
                  },
                  previous,
                  created,
                );

                // Packing the block and send request to the database
                const request = messages.add({
                  id: amount,
                  nonce: generated.nonce,
                  hash: generated.hash,
                  previous,
                  created,
                });

                // Listening: "error"
                request.addEventListener("error", (e) => reject(e));

                // Listening: "success"
                request.addEventListener(
                  "success",
                  (e) => resolve(e.target.result),
                );
              },
              (last) => reject(last),
            );
          },
          (amount) => reject(amount),
        );
      });
    }

    /**
     * Read the message from the database
     */
    read(id) {
      return new Promise((resolve, reject) => {
        if (typeof id === "number") {
          // Initializing of transaction to the database
          const transaction = this.db.transaction(["messages"]);

          // Initializing of table in the database
          const messages = transaction.objectStore("messages");

          // Send request to the database
          const request = messages.get(id);

          // Listening: "error"
          request.addEventListener("error", (e) => reject(e));

          // Listening: "success"
          request.addEventListener("success", (e) => resolve(e.target.result));
        } else reject("Could not initialize id");
      });
    }

    /**
     * Read the latest message from the database
     */
    last() {
      return new Promise((resolve, reject) => {
        this.count().then(
          (amount) => {
            if (amount > 0) {
              this.read(amount - 1).then(
                (last) => resolve(last),
                (last) => reject(last),
              );
            } else resolve({});
          },
          (amount) => reject(amount),
        );
      });
    }

    /**
     * Read all messages from the database
     */
    all() {
      return new Promise((resolve, reject) => {
        // Initializing of transaction to the database
        const transaction = this.db.transaction(["messages"]);

        // Initializing of table in the database
        const messages = transaction.objectStore("messages");

        // Send request to the database
        const request = messages.getAll();

        // Listening: "error"
        request.addEventListener("error", (e) => reject(e));

        // Listening: "success"
        request.addEventListener("success", (e) => resolve(e.target.result));
      });
    }
  };

  // Dispatch event: "initialized"
  document.dispatchEvent(
    new CustomEvent("asdasd.initialized", {
      detail: { asdasd: window.asdasd },
    }),
  );
}

// Dispatch event: "loaded"
document.dispatchEvent(
  new CustomEvent("asdasd.loaded", {
    detail: { asdasd: window.asdasd },
  }),
);
