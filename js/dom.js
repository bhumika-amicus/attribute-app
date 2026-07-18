export function $(selector, parent = document){

    return parent.querySelector(selector);

}


export function $$(selector, parent = document){

    return [
        ...parent.querySelectorAll(selector)
    ];

}


export function on(element, event, handler){

    element?.addEventListener(
        event,
        handler
    );

}


export function createEl(tag, options = {}){

    const element =
        document.createElement(tag);


    if(options.className){

        element.className =
            options.className;

    }


    if(options.text){

        element.textContent =
            options.text;

    }


    return element;

}


export function createFragment(){

    return document.createDocumentFragment();

}