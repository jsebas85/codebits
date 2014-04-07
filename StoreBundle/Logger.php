<?php

namespace Acme\StoreBundle;


class Logger
{
	
	protected $className;
	public function log($message)
	{
		echo $this->className . ' ' . time() .' ' . $message;
	}

	public function __construct($className)
	{
		$this->className = $className;
	}
}
