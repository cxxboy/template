import {log} from "../../common/js/util"

import "../../common/css/reset.css"
import "uikit/dist/css/uikit.min.css"
import "./index.css"
import "./index.html"

import {sayHello} from './ad'

$(document).ready(function() {
    log($("#index-title").text())
    log(sayHello('asd'))
})