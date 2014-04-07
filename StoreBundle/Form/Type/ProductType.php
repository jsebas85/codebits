<?php

namespace Acme\StoreBundle\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

class ProductType extends AbstractType
{
	protected $categories;

    public function __construct($categories)
    {
    	$this->categories = $categories;
    }
    public function buildForm(FormBuilderInterface $builder, array $options)
	{
		$builder
		->add('name', 'text')
		->add('price', 'text')
		->add('description', 'text')
		->add('category', 'entity', 
			array(
			    'choices'   => $this->categories,
			   'class' => 'AcmeStoreBundle:Category',))
		->add('save', 'submit');
	}
	
	public function getName()
	{
		return "product";
	}

	public function setDefaultOptions(OptionsResolverInterface $resolver)
	{
		$resolver->setDefaults(
			array('data_class' => 'Acme\StoreBundle\Entity\Product',
				'cascade_validation' => true,));
	}

	public function getCategories()
	{
		$choices = array();
		$all = $this->categories;
		foreach ($all as $category) {
	        $choices[$category->getId()] = $category->getName();
	    }
	    echo var_dump($choices); exit;
	    return $choices;
	}
}
