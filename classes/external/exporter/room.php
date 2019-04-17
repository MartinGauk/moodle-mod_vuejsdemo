<?php

namespace mod_vuejsdemo\external\exporter;

defined('MOODLE_INTERNAL') || die();

class room extends \core\external\exporter {
    protected $room;

    public function __construct($room, \context $context) {
        $this->room = $room;

        parent::__construct([], ['context' => $context]);
    }

    protected static function define_other_properties() {
        return [
            'id' => [
                'type' => PARAM_INT,
                'description' => 'room id',
            ],
            'name' => [
                'type' => PARAM_TEXT,
                'description' => 'room name',
            ],
            'description' => [
                'type' => PARAM_TEXT,
                'description' => 'room description',
            ],
        ];
    }

    protected static function define_related() {
        return [
            'context' => 'context',
        ];
    }

    protected function get_other_values(\renderer_base $output) {
        return [
            'id' => $this->room->id,
            'name' => $this->room->name,
            'description' => $this->room->description,
        ];
    }
}
