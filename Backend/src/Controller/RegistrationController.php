<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

class RegistrationController extends AbstractController
{
    #[Route('/api/register', name: 'api_register', methods: ['POST'])]
    public function register(
        Request $request,
        UserPasswordHasherInterface $userPasswordHasher,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        // Validierung
        if (empty($data['username']) || empty($data['password'])) {
            return $this->json(['error' => 'Username and password are required'], 400);
        }

        $user = new User();
        $user->setUsername($data['username']);
        $user->setPassword(
            $userPasswordHasher->hashPassword($user, $data['password'])
        );

        try {
            $entityManager->persist($user);
            $entityManager->flush();
            } catch (\Doctrine\DBAL\Exception\UniqueConstraintViolationException $e) {
                return $this->json(['error' => 'Username already exists'], 409);
        }
        return $this->json([
            'message' => 'User registered successfully',
            'user'    => [
                'id'       => $user->getId(),
                'username' => $user->getUsername(),
            ]
        ], 201);
    }
}