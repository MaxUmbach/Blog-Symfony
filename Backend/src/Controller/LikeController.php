<?php

namespace App\Controller;

use App\Entity\Like;
use App\Entity\Post;
use App\Repository\LikeRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/posts/{id}/likes')]
#[IsGranted('ROLE_USER')]
class LikeController extends AbstractController
{
    #[Route('', name: 'api_likes_toggle', methods: ['POST'])]
    public function toggle(Post $post, LikeRepository $likeRepository, EntityManagerInterface $entityManager): JsonResponse
    {
    $user = $this->getUser();
    $existing = $likeRepository->findOneBy(['user' => $user->getUserIdentifier(), 'post' => $post]);

    if (!$existing) {
        $existing = $likeRepository->findOneBy(['post' => $post, 'user' => $user]);
    }

    if ($existing) {
        $entityManager->remove($existing);
        $entityManager->flush();
        return $this->json(['liked' => false, 'count' => $post->getLikeCount()]);
    }

    $like = new Like();
    $like->setUser($user);
    $like->setPost($post);

    $entityManager->persist($like);
    $entityManager->flush();

    return $this->json(['liked' => true, 'count' => $post->getLikeCount()]);
    }
}