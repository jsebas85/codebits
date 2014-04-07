<?php

namespace Shopper\ShopBundle\DataFixtures\ORM;

use Doctrine\Common\DataFixtures\FixtureInterface;
use Doctrine\Common\Persistence\ObjectManager;
use Shopper\ShopBundle\Entity\Product;

class ProductFixtures implements FixtureInterface
{
    public function load(ObjectManager $manager)
    {
        $blog1 = new Product();
        $blog1->setTitle('Umbrella');
        $blog1->setImage('1.jpg');
        $blog1->setSeller('dsyph3r');
        $blog1->setTags('symfony2, php, paradise, symblog');
        $manager->persist($blog1);

        $blog2 = new Product();
        $blog2->setTitle('Pool');
        $blog2->setImage('2.jpg');
        $blog2->setSeller('Zero Cool');
        $blog2->setTags('pool, leaky, hacked, movie, hacking, symblog');
        $manager->persist($blog2);

        $blog3 = new Product();
        $blog3->setTitle('Book');
        $blog3->setImage('3.jpg');
        $blog3->setSeller('Gabriel');
        $blog3->setTags('misdirection, magic, movie, hacking, symblog');
        $manager->persist($blog3);

        $blog4 = new Product();
        $blog4->setTitle('Movie');
        $blog4->setImage('4.jpg');
        $blog4->setSeller('Kevin Flynn');
        $blog4->setTags('grid, daftpunk, movie, symblog');
        $manager->persist($blog4);

        $blog5 = new Product();
        $blog5->setTitle('Computer');
        $blog5->setImage('5.jpg');
        $blog5->setSeller('Gary Winston');
        $blog5->setTags('binary, one, zero, alive, dead, !trusting, movie, symblog');
        $manager->persist($blog5);

        $manager->flush();
    }

}