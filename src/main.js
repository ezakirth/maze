import "normalize.css";
import "./styles.scss";

import input from "./Input.js";

import Engine from "./Engine.js";

input.init();
window.input = input;

let engine = new Engine();
engine.init();
