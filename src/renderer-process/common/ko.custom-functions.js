import ko from "knockout";
ko.subscribable.fn.toggleable = function() {
    this.toggle = () => this(!this());
    return this;
}
