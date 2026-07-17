#!/usr/bin/env bash
set -euo pipefail

CLUSTER_NAME="mymel-cluster"

echo "=== 1. Checking if k3d cluster '$CLUSTER_NAME' already exists ==="
if k3d cluster list | grep -q "$CLUSTER_NAME"; then
  echo "Cluster '$CLUSTER_NAME' exists. Deleting it..."
  k3d cluster delete "$CLUSTER_NAME"
fi

echo "=== 2. Creating k3d cluster '$CLUSTER_NAME' ==="
# Expose port 80 and 443 to localhost through the load balancer
k3d cluster create "$CLUSTER_NAME" \
  --port "80:80@loadbalancer" \
  --port "443:443@loadbalancer" \
  --agents 1 \
  --wait

echo "=== 3. Creating namespaces ==="
kubectl create namespace argocd
kubectl create namespace mymel

echo "=== 4. Installing ArgoCD ==="
# Apply official ArgoCD stable manifests with server-side apply to prevent "metadata.annotations: Too long" error
kubectl apply --server-side -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

echo "=== 5. Waiting for ArgoCD Server to be ready ==="
kubectl rollout status deployment/argocd-server -n argocd --timeout=300s

echo "=== Cluster Setup Complete! ==="
echo "To retrieve the ArgoCD Admin password, run:"
echo "  kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath=\"{.data.password}\" | base64 -d"
echo "To port-forward the ArgoCD Server to port 8081, run:"
echo "  kubectl port-forward svc/argocd-server -n argocd 8081:443"
