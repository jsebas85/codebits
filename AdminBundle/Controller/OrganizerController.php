<?php

namespace AdminBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

/**
 * Organizer controller
 *
 */
class OrganizerController extends Controller
{

    /**
     * Action to list organizers 
     * @return Render of organizers list.
     */
    public function listOrganizersAction(Request $request) {
		$this->grantAccess();
        $organizerService = $this->get('organizer_service');
        $organizerInformation = $organizerService->getOrganizers();   
        return $this->render(
                'AdminBundle:Organizer:listOrganizers.html.twig',
                array('organizers' => $organizerInformation
                )
        );
    }

	/**
     * Action to update an organizer
     * @return Response indicating if the action was successful or not.
     */
    public function updateOrganizerAction(Request $request) {
		$this->grantAccess();
        try {
            $organizerData = $request->get('Organizer');
            $organizerService = $this->get('organizer_service');
            $organizerService->updateOrganizer($organizerData);
            return new Response('OK');
        } catch (\Exception $e) {
            return new Response($e->getMessage());
        }
    }

	/**
     * Action to delete an organizer
     * @return Response indicating if the action was successful or not.
     */
    public function deleteOrganizerAction(Request $request, $organizerId) {
		$this->grantAccess();
        try {
            $organizerService = $this->get('organizer_service');
            $organizerService->deleteOrganizer($organizerId);
            return new Response('OK');
        } catch (\Exception $e) {
            return new Response('NOK');
        }
    }

    /**
     * Generates a reporting for selected organizer
     * @return Calcul de la recette selon les critères seléctionnés pour gestioner les acomptes
     */
    public function generateReportAction(Request $request) {
		$this->grantAccess();
        $organizerService = $this->get('organizer_service');
        $content = $organizerService->generateReport();
        return new Response($content, 200, array(
            'Content-Type' => 'application/force-download',
            'Content-Disposition' => 'attachment; filename="' . date('Ymd') . '_' . date('His') . '_' . 'Reporting.pdf"'
        ));
    }
	
	/*
    * Action for sending by mail a reporting
    * @return Reponse confirming or not the mail delivery
    */
    public function sendReportAction(Request $request)
    {
		$this->grantAccess();
        $mailData = $this->getRequest()->request->all();
        $path = $this->container->getParameter('root_dir') . '/generated/tmp/';
        $fileName = $path . $mailData['fileName'];

        $parameters['from']         = 'noreply@mail.com';
        $parameters['fromName']     = 'Staff';
        $parameters['to']           = [];
        $parameters['attachments']  = [];
        $parameters['attachments'][] = $fileName;
        $parameters['subject'] = str_replace('\n', '<br/>', $mailData['subject']);
        $parameters['body'] = $mailData['body'];

        foreach ($mailData['to'] as $toMail) {
            array_push($parameters['to'], $toMail);
        }
        try {
            $this->get('mailer')->sendMessage(
                'organizer/report.html.twig',
                $parameters,
                $parameters['from'],
                $parameters['to'],
                $parameters['fromName']
            );
            return new JsonResponse("OK");
        }
        catch (\RuntimeException $e) {
            throw new \RuntimeException('Error sending mail:' . $e->getMessage());
        }
    }
	
	/**
	* Validates if an organizer is in the session to grant the access
	* @throws AccessDeniedHttpException if organizer not found on the session
	*/
	private function grantAccess()
    {
        $session = $this->get('session');
        if( !($session->has('organisateur') && ($session->get('organisateur')))) {
            throw new AccessDeniedHttpException;
        }
    }


}