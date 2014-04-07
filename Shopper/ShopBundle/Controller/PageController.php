<?php

namespace Shopper\ShopBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Shopper\ShopBundle\Entity\Enquiry; 
use Shopper\ShopBundle\Form\EnquiryType; 

class PageController extends Controller
{
    public function indexAction()
    {
        $em = $this->getDoctrine()->getEntityManager();

        $products = $em->getRepository('ShopperShopBundle:Product')
                    ->getLatestProducts();

        return $this->render('ShopperShopBundle:Page:index.html.twig', array(
            'products' => $products
        ));
    }

    public function aboutAction()
    {
        return $this->render('ShopperShopBundle:Page:about.html.twig');
    }

    public function contactAction()
    {
        $enquiry = new Enquiry();
	    $form = $this->createForm(new EnquiryType(), $enquiry);

	    $request = $this->getRequest();
	    if ($request->getMethod() == 'POST') {
	        $form->handleRequest($request);

	        if ($form->isValid()) {
	            // Perform some action, such as sending an email

	            // Redirect - This is important to prevent users re-posting
	            // the form if they refresh the page
	            return $this->redirect($this->generateUrl('ShopperShopBundle_contact'));
	        }
	    }

	    return $this->render('ShopperShopBundle:Page:contact.html.twig', array(
	        'form' => $form->createView()
	    ));
    }
}
