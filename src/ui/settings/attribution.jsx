import {Config} from "data";
import {React, Strings} from "modules";

export default class BBDAttribution extends React.Component {

    buildTitle(name, version, author) {
        const title = Strings.Addons.title.split(/({{[A-Za-z]+}})/);
        const nameIndex = title.findIndex(s => s == "{{name}}");
        if (nameIndex) title[nameIndex] = name;
        const versionIndex = title.findIndex(s => s == "{{version}}");
        if (nameIndex) title[versionIndex] = version;
        const authorIndex = title.findIndex(s => s == "{{author}}");
        if (nameIndex) title[authorIndex] = author;
        return title.flat();
    }

    render() {
        return <div id="bbd-version">
            {this.buildTitle("BBD", Config.bbdVersion, <a href="https://github.com/rauenzi" target="_blank" rel="noopener noreferrer">Zerebos</a>)}
        </div>;
    }
}