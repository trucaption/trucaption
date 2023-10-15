/*
    Trucaption
    Copyright (C) 2023 Derek Kaser
    @license GPL-3.0-or-later
*/

import { createRoot } from "react-dom/client";
import Viewer from "./Viewer.jsx";

import "./i18n";

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<Viewer />);
