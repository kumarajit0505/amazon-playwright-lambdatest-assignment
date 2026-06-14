const RESET = "\x1b[0m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const CYAN = "\x1b[36m";
const BOLD = "\x1b[1m";

class Logger {
  /**
   * @param {string} context  Label prepended to every log line (e.g. test name)
   */
  constructor(context) {
    this.context = context;
  }

  /**
   * @param {'INFO'|'SUCCESS'|'WARN'|'ERROR'} level
   * @param {string} message
   * @param {Record<string, unknown>} [data]
   */
  _log(level, message, data) {
    const ts = new Date().toISOString();
    const colour = { INFO: CYAN, SUCCESS: GREEN, WARN: YELLOW, ERROR: RED }[
      level
    ];
    const dataStr = data ? `  ${JSON.stringify(data)}` : "";
    console.log(
      `${colour}${BOLD}[${level}]${RESET} ${ts} ${BOLD}[${this.context}]${RESET} ${message}${dataStr}`,
    );
  }

  info(message, data) {
    this._log("INFO", message, data);
  }
  success(message, data) {
    this._log("SUCCESS", message, data);
  }
  warn(message, data) {
    this._log("WARN", message, data);
  }
  error(message, data) {
    this._log("ERROR", message, data);
  }

  /**
   * Log a prominent price-retrieval result — the core deliverable of the
   * assessment task.
   *
   * @param {string} productTitle
   * @param {string} price
   */
  logPriceResult(productTitle, price) {
    console.log("");
    console.log(
      `${GREEN}${BOLD}╔══════════════════════════════════════════════════╗${RESET}`,
    );
    console.log(
      `${GREEN}${BOLD}║  PRICE RETRIEVED                                 ║${RESET}`,
    );
    console.log(
      `${GREEN}${BOLD}╠══════════════════════════════════════════════════╣${RESET}`,
    );
    console.log(`${GREEN}${BOLD}║${RESET}  Context : ${this.context}`);
    console.log(
      `${GREEN}${BOLD}║${RESET}  Product : ${productTitle.substring(0, 19)}`,
    );
    console.log(`${GREEN}${BOLD}║${RESET}  Price   : ${BOLD}${price}${RESET}`);
    console.log(
      `${GREEN}${BOLD}╚══════════════════════════════════════════════════╝${RESET}`,
    );
    console.log("");
  }
}

module.exports = Logger;
