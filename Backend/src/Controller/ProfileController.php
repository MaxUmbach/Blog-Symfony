<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Doctrine\ORM\EntityManagerInterface;

#[Route('/api/profile')]
#[IsGranted('ROLE_USER')]
final class ProfileController extends AbstractController
{
    #[Route('', name: 'api_profile_get', methods: ['GET'])]
    public function get(): JsonResponse
    {
        $user = $this->getUser();

        return $this->json([
            'id'          => $user->getId(),
            'username'    => $user->getUsername(),
            'displayName' => $user->getDisplayName(),
            'bio'         => $user->getBio(),
            'websiteUrl'  => $user->getWebsiteUrl(),
            'avatar'      => $user->getAvatar(),
        ]);
    }

    #[Route('', name: 'api_profile_update', methods: ['PUT', 'PATCH'])]
    public function update(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);

        if (isset($data['displayName'])) $user->setDisplayName($data['displayName']);
        if (isset($data['bio']))         $user->setBio($data['bio']);
        if (isset($data['websiteUrl']))  $user->setWebsiteUrl($data['websiteUrl']);

        $entityManager->flush();

        return $this->json([
            'message'     => 'Profile updated',
            'displayName' => $user->getDisplayName(),
            'bio'         => $user->getBio(),
            'websiteUrl'  => $user->getWebsiteUrl(),
            'avatar'      => $user->getAvatar(),
        ]);
    }

    #[Route('/avatar', name: 'api_profile_avatar', methods: ['POST'])]
    public function uploadAvatar(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $user = $this->getUser();
        $file = $request->files->get('avatar');

        if (!$file) {
            return $this->json(['error' => 'No file uploaded'], 400);
        }

        $allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!in_array($file->getMimeType(), $allowedTypes)) {
            return $this->json(['error' => 'Invalid file type'], 400);
        }

        $filename = uniqid() . '.' . $file->guessExtension();
        $file->move($this->getParameter('avatars_directory'), $filename);

        // altes Avatar löschen
        $oldAvatar = $user->getAvatar();
        if ($oldAvatar) {
            $oldPath = $this->getParameter('avatars_directory') . '/' . $oldAvatar;
            if (file_exists($oldPath)) unlink($oldPath);
        }

        $user->setAvatar($filename);
        $entityManager->flush();

        return $this->json([
            'avatar' => $filename,
            'url'    => '/uploads/avatars/' . $filename,
        ]);
    }
}