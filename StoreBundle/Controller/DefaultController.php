<?php

namespace Acme\StoreBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Acme\StoreBundle\Entity\Product;
use Acme\StoreBundle\Entity\Category;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Acme\StoreBundle\Form\Type\ProductType;

class DefaultController extends Controller
{
    public function indexAction($name)
    {
        return $this->render('AcmeStoreBundle:Default:index.html.twig', array('name' => $name));
    }
	
	public function createAction(Request $request)
	{
		$product = new Product();
		$category = new Category();
		$product->setCategory($category);

		$validator = $this->get('validator');
		$errors = $validator->validate($product);
		if (count($errors) > 0) 
		{
			/*
			* Uses a __toString method on the $errors variable which is a
			* ConstraintViolationList object. This gives us a nice string
			* for debugging
			*/
			$errorsString = (string) $errors;
			return new Response($errorsString);
		}
		$categories = $this->getDoctrine()->getRepository('AcmeStoreBundle:Category')->findAll();
		$form = $this->createForm(new ProductType($categories), $product);
		$form->handleRequest($request);
		if ($form->isValid()) {
		// perform some action, such as saving the task to the database
			$em = $this->getDoctrine()->getManager();
			//$em->persist($category);
			$em->persist($product);
			$em->flush();
			return $this->redirect($this->generateUrl('acme_all'));
		}
		return $this->render('AcmeStoreBundle:Default:new.html.twig', array('form' => $form->createView(),));
	}
	
	public function showAction($id)
	{
		$product = $this->getDoctrine()->getRepository('AcmeStoreBundle:Product')->find($id);
		$answer = $this->get('translator')->trans('No existe el producto con identificador');
		$logger = $this->get('my_logger');
		$logger->log($answer);
		if (!$product) {
			throw $this->createNotFoundException($answer.' ' .$id);
		}
		return new Response('<body> El producto '.$product->getName() . ' cuesta '.$product->getPrice() . '</body> ');
	}
	
	public function updateAction($id, $price)
	{
		$em = $this->getDoctrine()->getManager();
		$product = $em->getRepository('AcmeStoreBundle:Product')->find($id);
		if (!$product) {
		throw $this->createNotFoundException('No existe el producto con identificador '.$id	);
		}
		$product->setPrice($price);
		$em->flush();
		return $this->redirect($this->generateUrl('acme_show', array('id' => $id)));
	}
	
	public function searchAction($price) 
	{
		$em = $this->getDoctrine()->getManager();
		$query = $em->createQuery(
		'SELECT p
		FROM AcmeStoreBundle:Product p
		WHERE p.price > :price
		ORDER BY p.price ASC'
		)->setParameter('price', $price);
		$products = $query->getResult();
		$answer = $this->showProducts($products);
		return new Response($answer);
	}
	
	public function allAction()
	{
		$em = $this->getDoctrine()->getManager();
		$products = $em->getRepository('AcmeStoreBundle:Product')->findAllOrderedByPrice();
		$answer = $this->showProducts($products);
		return new Response($answer);
	}
	
	public function showProducts($products) 
	{
		$user = $this->getUser();
		$url = $this->get('router')->generate('logout');
		$answer = '<body>Hello ' . $user->getUsername() .'. <a href="' . $url .'">Logout</a>' . "<ul>";
		foreach($products as $item)
		{
			$answer .= "<li>" . $item->getName() . " " . $item->getPrice() . "</li>" ;
		}
		return $answer . "</ul></body> ";
	}
}
