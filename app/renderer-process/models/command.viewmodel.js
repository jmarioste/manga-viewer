export default class Command {
    constructor(hotkey, execute) {
        this.hotkey = hotkey;
        this.execute = execute;
    }
}

export const DefaultCommandHotkeys = {
    BOOKMARK_FOLDER: "CTRL + D",
    BOOKMARK_MANGA: "D",
    NEXT_PAGE: "RIGHT ARROW",
    PREVIOUS_PAGE: "LEFT ARROW",
    FOCUS_SEARCH: "CTRL + F",
    OPEN_DIRECTORY: "CTRL + O",
    BACK_TO_LIST: "BACKSPACE"
}
