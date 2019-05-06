<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * This page is the entry page into the mod.
 *
 * @package    mod_vuejsdemo
 * @copyright  2019 Martin Gauk, innoCampus, TU Berlin
 */

require('../../config.php');
require_once('lib.php');

// if url has form view.php?id=xy then redirect to to view.php/xy
$coursemoduleid = optional_param('id', 0, PARAM_INT);
if ($coursemoduleid > 0) {
    $path = '/mod/vuejsdemo/view.php/' . $coursemoduleid . '/';
    redirect(new \moodle_url($path));
}
// Support for Vue.js Router and its URL structure.
// /mod/vuejsdemo/view.php/[course module id]/.../...
$paths = explode('/', $_SERVER['REQUEST_URI']);
$baseindex = array_search('view.php', $paths);
if (count($paths) > $baseindex + 1) {
    $coursemoduleid = intval($paths[$baseindex + 1]);
}

list($course, $coursemodule) = get_course_and_cm_from_cmid($coursemoduleid, 'vuejsdemo');

require_login($course, true, $coursemodule);

$title = get_string('modulename', 'mod_vuejsdemo');
$url = new moodle_url('/mod/vuejsdemo/view.php', ['id' => $coursemoduleid]);

$PAGE->set_context($coursemodule->context);
$PAGE->set_title($title);
$PAGE->set_heading($title);
$PAGE->set_url($url);
$PAGE->set_pagelayout('standard');

$PAGE->requires->js_call_amd('mod_vuejsdemo/app-lazy', 'init', [
    'coursemoduleid' => $coursemodule->id,
    'contextid' => $coursemodule->context->id,
]);

echo $OUTPUT->header();

echo <<<'EOT'
<div id="mod-vuejsdemo-app">
  <router-view></router-view>
</div>
EOT;

echo $OUTPUT->footer($course);
