/**
 * Terminal input controller.
 * todo.
 *
 * @see TerminalElements.input
 * @param {Terminal} TERMINAL
 * @constructor
 */
var TerminalInput = function (TERMINAL) {

    /**
     * @type {Terminal}
     */
    this.TERMINAL = TERMINAL;

    /**
     * @type {boolean}
     * @debug
     */
    this.ENABLED = false;

    /**
     * @type {TerminalInputHistory}
     */
    this.history = new TerminalInputHistory();

    /**
     * @type {TerminalInputCaret}
     */
    this.caret = new TerminalInputCaret(this);

    /**
     * Variable that indicates last length of input to determine if text was erazed.
     *
     * @see this.prototype.onInput
     * @type {number}
     * @private
     */
    this.__inputLastLength = 0;

    /**
     * Shows the input beginning position.
     *
     * @type {{line: number, position: number}}
     * @private
     */
    this._initialPosition = {
        line: 0,
        position: 0
    };

    this.initialize();

};

TerminalInput.prototype.initialize = function () {

    var _this = this;

    window.addEventListener("keydown", function () { // PC devices
        // activeElement can be HTMLInputElement
        // noinspection JSValidateTypes
        if (_this.ENABLED && document.activeElement !== _this.TERMINAL.elements.input) {
            _this.focus();
        }
    });

    this.TERMINAL.elements.terminal.addEventListener("touchend", function (event) { // touch devices
        if (_this.ENABLED && document.getSelection().isCollapsed) { // enabled & no selection
            event.preventDefault();
            _this.focus();
        }
    });

    this.TERMINAL.elements.input.addEventListener("input", function () {
        if (_this.ENABLED) {
            _this.onInput();
        }
    });

    this.TERMINAL.elements.input.addEventListener("keydown", function (event) {
        if (_this.ENABLED) {
            _this.keyDown(event);
        }
    });

};

/**
 * Focus on input.
 */
TerminalInput.prototype.focus = function () {
    this.TERMINAL.elements.input.blur();
    this.TERMINAL.elements.input.focus();
};

/**
 * Enable input.
 *
 * @private
 */
TerminalInput.prototype._enable = function () {

    this.ENABLED = true;
    this.TERMINAL.elements.input.removeAttribute("disabled");
    this.focus();
    this.caret.update();

};

/**
 * Disable input.
 *
 * @private
 */
TerminalInput.prototype._disable = function () {

    this.TERMINAL.elements.input.setAttribute("disabled", "");
    this.ENABLED = false;
    this.caret.hide();

};

/**
 * Returns caret position from beginning of input.
 */
TerminalInput.prototype.getCaretPosition = function () {
    return this.TERMINAL.elements.input.selectionStart || this.TERMINAL.elements.input.value.length;
};

/**
 * Terminal input handler. Fires when hidden input changes.
 *
 * The algorithm:
 *  ? Output can be print at any part of terminal because it is not restricted by size. So this
 *  function use capable options setup to allow printing out-of-terminal window.
 *  1. Print actual input at line where it was prompted and leave caret unrestricted;
 *  2. Print spaces on erased symbols place and then restore unrestricted caret position;
 *  3. Decrease top line if caret.x < 1 to make caret visible on screen;
 *  4. Restrict the caret position.
 */
TerminalInput.prototype.onInput = function () {

    var i, cx, cy,
        string = "",
        length = this.TERMINAL.elements.input.value.length;

    this.TERMINAL.output.printAtLine(
        this.TERMINAL.elements.input.value,
        this._initialPosition.line,
        this._initialPosition.position,
        false
    );

    for (i = 0; i < this.__inputLastLength - length; i++) {
        string += " ";
    }

    cx = this.TERMINAL.output.getCaretX();
    cy = this.TERMINAL.output.getCaretY();

    this.TERMINAL.output.$CARET_RESTRICTION_ON = false;
    this.TERMINAL.output.printSync(string);
    this.TERMINAL.output.$CARET_RESTRICTION_ON = true;
    if (this.TERMINAL.output.getCaretY() < 1) {
        this.TERMINAL.output.increaseTopLine(this.TERMINAL.output.getCaretY() - 1);
    }

    this.TERMINAL.output.setCaretX(cx);
    this.TERMINAL.output.setCaretY(cy);

    this.__inputLastLength = length;

    this.TERMINAL.output.scrollToActualLine();
    this.caret.update();

};

/**
 * Key press handler. Handles non-printable characters and keyboard combinations.
 *
 * @param {KeyboardEvent} event
 */
TerminalInput.prototype.keyDown = function (event) {

    var key = event.charCode || event.keyCode;

    switch (key) {
        case 13: this.submit(); break; // enter
    }

};

/**
 * Submit the input. Also is the handler.
 */
TerminalInput.prototype.submit = function () {

    this.TERMINAL.controller.terminalQuery(this.TERMINAL.elements.input.value);
    this.TERMINAL.elements.input.value = "";
    this.__inputLastLength = 0;

};

/**
 * @param {string} [invitationMessage]
 * @param {function} [handler]
 */
TerminalInput.prototype.prompt = function (invitationMessage, handler) {

    if (invitationMessage) {
        this.TERMINAL.output.printNewLine();
        this.TERMINAL.output.printSync(invitationMessage);
    }

    this._initialPosition.line = this.TERMINAL.output.getLineNumber();
    this._initialPosition.position = this.TERMINAL.output.getCaretX() - 1;

    this._enable();

};