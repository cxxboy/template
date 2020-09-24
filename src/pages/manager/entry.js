import {log} from "../../common/js/util"
import $ from 'jquery/dist/jquery.min'

import "../../common/css/reset.scss"
import "./index.css"

$(document).ready(function () {
    log($("#index-title").text())
})