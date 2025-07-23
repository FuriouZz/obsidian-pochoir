const linkTransform = {
    regex: /\[(.*)\]\((.*)\)/g,
    transform(match: RegExpExecArray) {
        const name = match[1] ?? "";
        const url = match[2] ?? "";
        return `<a href="${url}">${name}</a>`;
    },
};

const rawLinkTransform = {
    regex: /\s+(https?:\/\/(\S+))\s+/g,
    transform(match: RegExpExecArray) {
        const url = match[1];
        return `<a href="${url}">${url}</a>`;
    },
};

const lineBreak = {
    regex: /\n{2}/g,
    transform(_match: RegExpExecArray) {
        return "<br />";
    },
};

const transforms = [linkTransform, rawLinkTransform, lineBreak];

export function minidown(content: string) {
    let str = content;
    for (const transform of transforms) {
        for (const match of str.matchAll(transform.regex)) {
            const res = transform.transform(match);
            const p1 = str.slice(0, match.index);
            const p2 = str.slice(match.index + match[0].length, str.length);
            str = p1 + res + p2;
        }
    }
    return str;
}

export function minidownFragment(content: string) {
    const fragment = new DocumentFragment();
    const element = document.createElement("div");
    element.innerHTML = minidown(content);
    fragment.append(element);
    return fragment;
}
