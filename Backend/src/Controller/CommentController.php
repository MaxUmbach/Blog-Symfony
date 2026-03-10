<?php

namespace App\Controller;

use App\Entity\Comment;
use App\Entity\Post;
use App\Repository\CommentRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/posts/{id}/comments')]
class CommentController extends AbstractController
{
    #[Route('', name: 'api_comments_index', methods: ['GET'])]
    public function index(Post $post): JsonResponse
    {
        $comments = $post->getComments();

        $data = array_map(fn(Comment $comment) => [
            'id'        => $comment->getId(),
            'content'   => $comment->getContent(),
            'author'    => $comment->getAuthor()?->getUsername(),
            'avatar'    => $comment->getAuthor()?->getAvatar(),
            'createdAt' => $comment->getCreatedAt()?->format('c'),
        ], $comments->toArray());

        return $this->json($data);
    }

    #[IsGranted('ROLE_USER')]
    #[Route('', name: 'api_comments_new', methods: ['POST'])]
    public function new(Request $request, Post $post, EntityManagerInterface $entityManager): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (empty($data['content'])) {
            return $this->json(['error' => 'Content is required'], 400);
        }

        $comment = new Comment();
        $comment->setContent($data['content']);
        $comment->setCreatedAt(new \DateTime());
        $comment->setPost($post);
        $comment->setAuthor($this->getUser());

        $entityManager->persist($comment);
        $entityManager->flush();

        return $this->json([
            'id'        => $comment->getId(),
            'content'   => $comment->getContent(),
            'author'    => $comment->getAuthor()?->getUsername(),
            'createdAt' => $comment->getCreatedAt()?->format('c'),
        ], 201);
    }

    #[IsGranted('ROLE_USER')]
    #[Route('/{commentId}', name: 'api_comments_delete', methods: ['DELETE'])]
    public function delete(Post $post, int $commentId, CommentRepository $commentRepository, EntityManagerInterface $entityManager): JsonResponse
    {
        $comment = $commentRepository->find($commentId);

        if (!$comment || $comment->getPost() !== $post) {
            return $this->json(['error' => 'Comment not found'], 404);
        }

        if ($comment->getAuthor() !== $this->getUser()) {
            return $this->json(['error' => 'Not allowed'], 403);
        }

        $entityManager->remove($comment);
        $entityManager->flush();

        return $this->json(null, 204);
    }
}