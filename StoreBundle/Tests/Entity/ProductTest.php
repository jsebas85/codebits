<?php 

namespace Acme\StoreBundle\Tests\Entity;
use Acme\StoreBundle\Entity\Product;
class ProductTest extends \PHPUnit_Framework_TestCase
{
public function testAdd()
{
$product = new Product();
$product->setPrice(12);
// assert that your calculator added the numbers correctly!
$this->assertEquals(12, $product->getPrice());
}
}