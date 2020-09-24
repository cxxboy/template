import {log} from "../../common/js/util"

import "../../common/css/reset.scss"
import "./index.scss"

import {sayHello} from './ad'

$(document).ready(function() {
    log($("#index-title").text())
    log(sayHello('asd'))
})