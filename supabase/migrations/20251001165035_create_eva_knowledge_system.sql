/*
  # EVA Knowledge and Memory System

  1. New Tables
    - `conversations`
      - `id` (uuid, primary key) - Unique conversation identifier
      - `user_id` (text) - User identifier (anonymous for now)
      - `created_at` (timestamptz) - Conversation creation time
      - `updated_at` (timestamptz) - Last update time
      - `title` (text) - Conversation title
      - `context_summary` (text) - Aggregated context summary
    
    - `messages`
      - `id` (uuid, primary key) - Message identifier
      - `conversation_id` (uuid, foreign key) - Reference to conversation
      - `role` (text) - Message role (user/assistant/system)
      - `content` (text) - Message content
      - `embedding` (vector(1536)) - Vector embedding for semantic search
      - `created_at` (timestamptz) - Message timestamp
      - `metadata` (jsonb) - Additional message metadata
    
    - `knowledge_nodes`
      - `id` (uuid, primary key) - Knowledge node identifier
      - `content` (text) - Knowledge content
      - `embedding` (vector(1536)) - Vector embedding
      - `confidence` (float) - Confidence score
      - `source` (text) - Knowledge source
      - `category` (text) - Knowledge category
      - `created_at` (timestamptz) - Creation time
      - `access_count` (integer) - Access frequency
      - `last_accessed` (timestamptz) - Last access time
      - `metadata` (jsonb) - Additional metadata
    
    - `training_examples`
      - `id` (uuid, primary key) - Training example identifier
      - `user_input` (text) - User input example
      - `expected_response` (text) - Expected response
      - `category` (text) - Training category
      - `priority` (text) - Priority level
      - `tags` (text[]) - Tags array
      - `created_at` (timestamptz) - Creation time
      - `embedding` (vector(1536)) - Vector embedding
    
    - `personality_settings`
      - `id` (uuid, primary key) - Settings identifier
      - `user_id` (text) - User identifier
      - `curiosity` (integer) - Curiosity level (0-100)
      - `technicality` (integer) - Technical detail level (0-100)
      - `creativity` (integer) - Creativity level (0-100)
      - `formality` (integer) - Formality level (0-100)
      - `verbosity` (integer) - Response length preference (0-100)
      - `system_references` (integer) - System info visibility (0-100)
      - `updated_at` (timestamptz) - Last update time
    
    - `learning_metrics`
      - `id` (uuid, primary key) - Metric identifier
      - `timestamp` (timestamptz) - Metric timestamp
      - `total_conversations` (integer) - Total conversations count
      - `total_messages` (integer) - Total messages count
      - `knowledge_nodes_count` (integer) - Knowledge nodes count
      - `successful_interactions` (integer) - Successful interactions
      - `average_confidence` (float) - Average confidence score
      - `metadata` (jsonb) - Additional metrics

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access (future auth integration)
    - Allow public read/write for initial development phase

  3. Indexes
    - Vector similarity search indexes for embeddings
    - Timestamp indexes for efficient queries
    - Foreign key indexes for joins

  4. Important Notes
    - Vector extension required for embeddings
    - Embeddings dimension set to 1536 (OpenAI ada-002 standard)
    - All timestamps use timestamptz for timezone awareness
    - JSONB used for flexible metadata storage
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL DEFAULT 'anonymous',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  title text DEFAULT 'New Conversation',
  context_summary text DEFAULT ''
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to conversations"
  ON conversations FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to conversations"
  ON conversations FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to conversations"
  ON conversations FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  role text NOT NULL,
  content text NOT NULL,
  embedding vector(1536),
  created_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to messages"
  ON messages FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to messages"
  ON messages FOR INSERT
  TO public
  WITH CHECK (true);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS messages_embedding_idx ON messages 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX IF NOT EXISTS messages_conversation_id_idx ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages(created_at);

-- Knowledge nodes table
CREATE TABLE IF NOT EXISTS knowledge_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  embedding vector(1536),
  confidence float DEFAULT 0.5,
  source text DEFAULT 'user',
  category text DEFAULT 'general',
  created_at timestamptz DEFAULT now(),
  access_count integer DEFAULT 0,
  last_accessed timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE knowledge_nodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to knowledge_nodes"
  ON knowledge_nodes FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to knowledge_nodes"
  ON knowledge_nodes FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to knowledge_nodes"
  ON knowledge_nodes FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS knowledge_nodes_embedding_idx ON knowledge_nodes 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX IF NOT EXISTS knowledge_nodes_category_idx ON knowledge_nodes(category);
CREATE INDEX IF NOT EXISTS knowledge_nodes_created_at_idx ON knowledge_nodes(created_at);

-- Training examples table
CREATE TABLE IF NOT EXISTS training_examples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_input text NOT NULL,
  expected_response text NOT NULL,
  category text DEFAULT 'general',
  priority text DEFAULT 'medium',
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  embedding vector(1536)
);

ALTER TABLE training_examples ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to training_examples"
  ON training_examples FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to training_examples"
  ON training_examples FOR INSERT
  TO public
  WITH CHECK (true);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS training_examples_embedding_idx ON training_examples 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX IF NOT EXISTS training_examples_category_idx ON training_examples(category);

-- Personality settings table
CREATE TABLE IF NOT EXISTS personality_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL DEFAULT 'default',
  curiosity integer DEFAULT 70,
  technicality integer DEFAULT 50,
  creativity integer DEFAULT 60,
  formality integer DEFAULT 40,
  verbosity integer DEFAULT 50,
  system_references integer DEFAULT 30,
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT curiosity_range CHECK (curiosity >= 0 AND curiosity <= 100),
  CONSTRAINT technicality_range CHECK (technicality >= 0 AND technicality <= 100),
  CONSTRAINT creativity_range CHECK (creativity >= 0 AND creativity <= 100),
  CONSTRAINT formality_range CHECK (formality >= 0 AND formality <= 100),
  CONSTRAINT verbosity_range CHECK (verbosity >= 0 AND verbosity <= 100),
  CONSTRAINT system_references_range CHECK (system_references >= 0 AND system_references <= 100)
);

ALTER TABLE personality_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to personality_settings"
  ON personality_settings FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to personality_settings"
  ON personality_settings FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to personality_settings"
  ON personality_settings FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Insert default personality settings
INSERT INTO personality_settings (user_id) 
VALUES ('default')
ON CONFLICT DO NOTHING;

-- Learning metrics table
CREATE TABLE IF NOT EXISTS learning_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz DEFAULT now(),
  total_conversations integer DEFAULT 0,
  total_messages integer DEFAULT 0,
  knowledge_nodes_count integer DEFAULT 0,
  successful_interactions integer DEFAULT 0,
  average_confidence float DEFAULT 0.0,
  metadata jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE learning_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to learning_metrics"
  ON learning_metrics FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to learning_metrics"
  ON learning_metrics FOR INSERT
  TO public
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS learning_metrics_timestamp_idx ON learning_metrics(timestamp);

-- Helper function to update conversation timestamp
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update conversation timestamp
DROP TRIGGER IF EXISTS update_conversation_timestamp_trigger ON messages;
CREATE TRIGGER update_conversation_timestamp_trigger
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- Helper function for semantic search on messages
CREATE OR REPLACE FUNCTION search_similar_messages(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count integer DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  conversation_id uuid,
  role text,
  content text,
  similarity float
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    messages.id,
    messages.conversation_id,
    messages.role,
    messages.content,
    1 - (messages.embedding <=> query_embedding) AS similarity
  FROM messages
  WHERE messages.embedding IS NOT NULL
    AND 1 - (messages.embedding <=> query_embedding) > match_threshold
  ORDER BY messages.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- Helper function for semantic search on knowledge nodes
CREATE OR REPLACE FUNCTION search_similar_knowledge(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count integer DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  content text,
  confidence float,
  source text,
  category text,
  similarity float
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    knowledge_nodes.id,
    knowledge_nodes.content,
    knowledge_nodes.confidence,
    knowledge_nodes.source,
    knowledge_nodes.category,
    1 - (knowledge_nodes.embedding <=> query_embedding) AS similarity
  FROM knowledge_nodes
  WHERE knowledge_nodes.embedding IS NOT NULL
    AND 1 - (knowledge_nodes.embedding <=> query_embedding) > match_threshold
  ORDER BY knowledge_nodes.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- Helper function to update knowledge node access
CREATE OR REPLACE FUNCTION increment_knowledge_access(node_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE knowledge_nodes
  SET 
    access_count = access_count + 1,
    last_accessed = now()
  WHERE id = node_id;
END;
$$ LANGUAGE plpgsql;