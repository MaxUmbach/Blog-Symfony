<?php

namespace App\Controller;

use App\Entity\Post;
use App\Repository\PostRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/posts')]
final class PostController extends AbstractController
{

    #[Route('/search', name: 'api_post_search', methods: ['GET'])]
    public function search(Request $request, PostRepository $postRepository): JsonResponse
    {
        $q = $request->query->get('q', '');

        if (strlen($q) < 2) {
            return $this->json([]);
        }

        $posts = $postRepository->search($q);

        $data = array_map(fn(Post $post) => $this->serializePost($post), $posts);

        return $this->json($data);
    }



    #[Route('', name: 'api_post_index', methods: ['GET'])]
    public function index(PostRepository $postRepository): JsonResponse
    {
        $posts = $postRepository->findAll();

        $data = array_map(fn(Post $post) => $this->serializePost($post), $posts);

        return $this->json($data);
    }

    #[Route('/{id}', name: 'api_post_show', methods: ['GET'])]
    public function show(Post $post): JsonResponse
    {
        return $this->json($this->serializePost($post));
    }

    #[IsGranted('ROLE_USER')]
    #[Route('', name: 'api_post_new', methods: ['POST'])]
    public function new(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        // Validierung
        if (empty($data['title']) || empty($data['content'])) {
            return $this->json(['error' => 'Title and content are required'], 400);
        }

        $post = new Post();
        $post->setTitle($data['title']);
        $post->setContent($data['content']);
        $post->setCreatedAt(new \DateTime());       // ← hier
        $post->setAuthor($this->getUser());         // ← hier

        $entityManager->persist($post);
        $entityManager->flush();

        return $this->json($this->serializePost($post), 201);
    }

    #[IsGranted('POST_EDIT', subject: 'post')]
    #[Route('/{id}', name: 'api_post_edit', methods: ['PUT', 'PATCH'])]
    public function edit(Request $request, Post $post, EntityManagerInterface $entityManager): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (isset($data['title'])) $post->setTitle($data['title']);
        if (isset($data['content'])) $post->setContent($data['content']);
        // weitere Felder...

        $entityManager->flush();

        return $this->json($this->serializePost($post));
    }

    #[IsGranted('POST_DELETE', subject: 'post')]
    #[Route('/{id}', name: 'api_post_delete', methods: ['DELETE'])]
    public function delete(Post $post, EntityManagerInterface $entityManager): JsonResponse
    {
        $entityManager->remove($post);
        $entityManager->flush();

        return $this->json(null, 204);
    }

    // -------------------------------------------------------
    // Hilfsmethode – passe die Felder deiner Entity an
    // -------------------------------------------------------
    private function serializePost(Post $post): array
    {
        return [
            'id'        => $post->getId(),
            'title'     => $post->getTitle(),
            'content'   => $post->getContent(),
            'author' => $post->getAuthor()?->getUsername(),
            'createdAt' => $post->getCreatedAt()?->format('c'),
        ];
    }
}
