<?php

namespace Shopper\ShopBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class ProductController extends Controller
{
    public function showAction($id)
    {
       
		$em = $this->getDoctrine()->getEntityManager();

        $product = $em->getRepository('ShopperShopBundle:Product')->find($id);

        if (!$product) {
            throw $this->createNotFoundException('Unable to find product.');
        }

        return $this->render('ShopperShopBundle:Product:show.html.twig', array(
            'product'      => $product,
        ));
    }

    
   
}
