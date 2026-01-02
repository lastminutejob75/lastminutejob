-- Vérifier les permissions actuelles
SELECT 
  policyname, 
  cmd, 
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'jobs'
ORDER BY cmd, policyname;

