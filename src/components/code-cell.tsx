

import React, { useState, useEffect,useRef } from "react";

import CodeEditor from "./code-editor";
import Preview from "./preview";
import bundle from "../bundler";
import Resizable from "./resizable";
import TextEditor from "./text-editor";

const CodeCell = () => {

    const [input,setInput] = useState("");
    const [code,setCode] = useState("");
    const [error,setError] = useState("");

    useEffect(() => {
        const timer = setTimeout(async() => {
            const output = await bundle(input);
            setCode(output["code"]);
            setError(output["error"]);
        },1000)

        return () => {
            clearTimeout(timer);
        };
    },[input])




    return (
        <div>
            <TextEditor/>
            <Resizable direction="vertical">
                <div style={{ height: "100%", display: "flex", flexDirection: "row"}}>
                    <Resizable direction="horizontal">
                        <CodeEditor initialValue="const a=1;" onChange={(value) => setInput(value)}/>
                    </Resizable>
                    <Preview code={code} error={error}/>
                </div>
            </Resizable>
        </div>
    )
};


export default CodeCell;