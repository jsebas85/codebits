<?php

namespace AdminBundle\DTO;

/**
 * OrganizerEditable
 */
class OrganizerDTO
{

    /**
     * @var integer
     */
    public $id;

    /**
     * @var string
     */
    public $name;

    /**
     * @var boolean
     */
    public $isActive;

    /**
     * @var array
     */
    public $contacts;

    /**
     * Constructor
     */
    public function __construct()
    {
        $this->name = '';
        $this->isActive = true;
        $this->contacts = array();
    }

}
