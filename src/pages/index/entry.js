import { log } from "../../assets/js/util"

import "../../assets/css/reset.scss"
import "./index.scss"

import { sayHello } from './ad'

$(document).ready(function () {
    log(sayHello('asd'))
})