<?php

namespace App\Controller;

use App\Entity\Post;
use App\Repository\PostRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

final class HomeController extends AbstractController
{
    #[Route('/api/home', name: 'api_home', methods: ['GET'])]
    public function index(PostRepository $postRepository): JsonResponse
    {
        $posts = $postRepository->findBy([], ['createdAt' => 'DESC'], 5); // neueste 5 Posts

        $data = array_map(fn(Post $post) => [
            'id'        => $post->getId(),
            'title'     => $post->getTitle(),
            'content'   => $post->getContent(),
            'author'    => $post->getAuthor()?->getUsername(),
            'createdAt' => $post->getCreatedAt()?->format('c'),
        ], $posts);

        return $this->json($data);
    }
}