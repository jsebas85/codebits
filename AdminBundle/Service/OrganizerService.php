<?php

namespace AdminBundle\Service;

use AdminBundle\Repository\ContactRepository;
use AdminBundle\Repository\OrganizerRepository;

use AdminBundle\DTO\ContactDTO;
use AdminBundle\DTO\OrganizerDTO;

use Doctrine\ORM\EntityManager;
/**
 * Organizer Service
 *
 */
class OrganizerService
{
    /**
     * Organizer Repository
     *
     * @var organizerRepository
     */
    private $organizerRepository;

    /**
     * Contact Repository
     *
     * @var contactRepository
     */
    private $contactRepository;

    /**
     * Service to convert HTML in PDF
     *
     * @var LoggableGenerator
     */
    private $htmlToPdfService;

    /**
     * Service to render templates
     */
    private $templatingService;

    public function __construct() {
		
    }

    public function setOrganizerRepository(OrganizerRepository $organizerRepository) {
         $this->organizerRepository = $organizerRepository;
    }

    public function setContactRepository(ContactRepository $contactRepository) {
        $this->contactRepository = $contactRepository;
    }

    public function setHtmlToPdfService($htmlToPdfService) {
        $this->htmlToPdfService = $htmlToPdfService;
    }
    public function setTemplatingService($templatingService) {
        $this->templatingService = $templatingService;
    }
	
	/**
	* Returns all organizers as DTOs
	* @return array OrganizerDTO
	*/
    public function getOrganizers() {
        $organizers = $this->organizerRepository->findAll();
		return $this->convertToDTO($organizers);
    }

	/**
	* Updates an organizer information
	* @param $organizerData array
	*/
    public function updateOrganizer($organizerData) {
        $organizer = $this->organizerRepository->find($organizerData['id']);
		if (is_null($organizer){
			throw new Exception('Organizer could not be found');
		}
        $organizer->setActive($organizerData['isActive'] === 'true');
        $organizer->setName($organizerData['name']);
        $this->organizerRepository->update($organizer);
    }

	/**
	* Deletes an organizer
	* @param $organizerId int
	*/
    public function deleteOrganizer($organizerId) {
        $organizer = $this->organizerRepository->find($organizerId);
        $this->organizerRepository->delete($organizer);
    }

	/**
	* Generates a reporting for active organizers
	* return pdf information ready to be downloaded
	*/
    public function generateReport(){

        $organizers = $this->organizerRepository->findAllActive();
		$organizers = $this->convertToDTO($organizers);
		// Sort DTOs by name
        uasort($organizers, function ($a, $b)  {
            return strtolower($a->name) > strtolower($b->name);
        });

        $totalContacts = 0;
        foreach ($organizers as $organizer) {
            $totalContacts += count($organizer->contacts);
        }

        $html = $this->templatingService->renderResponse(
            'AdminBundle:organizer/accounting:reporting.html.twig',
            array(
                'organizers' => $organizers,
                'totalContacts' => $totalContacts
            )
        )->getContent();

        $left  = 'Le ' . date('d/m/Y H:i:s');
        $right = "Page [page]/[toPage]";

        $snappyPdf = $this->htmlToPdfService;
        $snappyPdf->setOption('encoding', 'UTF-8');
        $snappyPdf->setOption('footer-font-size', 8);
        $snappyPdf->setOption('footer-left', $left);
        $snappyPdf->setOption('footer-right', $right);
        $snappyPdf->setOption('footer-spacing', 5);
        return $snappyPdf->getOutputFromHtml($html, array(
                    'orientation'=>'Portrait',
                    'encoding' => 'UTF-8'));
    }

	/**
	* Transforms entities into DTOs for manipulating data
	* return array OrganizerDTO
	*/
    private function convertToDTO($organizers) {
		$result = array();
		foreach($organizers as $organizer) {
			$oDTO = new OrganizerDTO();
			$oDTO->id = $organizer->getId();
			$oDTO->name = $organizer->getName();
			$oDTO->isActive = $organizer->getId();
			$contacts = $organizer->getContacts();
			$cDTOs = array();
			foreach($contacts as $contact) {
				$cDTO = new ContactDTO();
				$cDTO->id = $contact->getId();
				$cDTO->name = $contact->getName();
				$cDTO->phone = $contact->getPhone();
				$cDTO->mail = $contact->getMail();
				$cDTOs[] = $cDto;
			}
			$oDTO->contacts = $cDTOs;
			$result[] = $oDTO;
		}
        return $result;
	}
  
}
