import {navigationTitle} from "../components/Navigation";
import BaseApp from "../components/BaseApp";
import React from "react";

export default function SqlPage() {
    navigationTitle.value = "sql";

    return (
        <BaseApp>
            {/*<SyntaxHighlighter language="javascript">a</SyntaxHighlighter>*/}
        </BaseApp>
    );
}