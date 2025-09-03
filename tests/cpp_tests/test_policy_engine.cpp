#include <gtest/gtest.h>
#include "../../ofo-core/cpp/include/policy_engine.h"
#include <memory>

using namespace eva::core;

class PolicyEngineTest : public ::testing::Test {
protected:
    void SetUp() override {
        policy_engine = std::make_unique<CPPPolicyEngine>();
    }
    
    void TearDown() override {
        if (policy_engine) {
            policy_engine->shutdown();
        }
    }
    
    std::unique_ptr<CPPPolicyEngine> policy_engine;
};

TEST_F(PolicyEngineTest, InitializationTest) {
    EXPECT_TRUE(policy_engine->initialize());
    EXPECT_TRUE(policy_engine->isEnforcementActive());
    EXPECT_GT(policy_engine->getActivePolicyCount(), 0);
}

TEST_F(PolicyEngineTest, PolicyComplianceTest) {
    ASSERT_TRUE(policy_engine->initialize());
    
    // Test allowed operations
    EXPECT_TRUE(policy_engine->canExecuteOperation("learning"));
    EXPECT_TRUE(policy_engine->canExecuteOperation("computation"));
    
    // Test policy enforcement
    EXPECT_TRUE(policy_engine->canExecuteOperation("reinforcement_learning"));
}

TEST_F(PolicyEngineTest, ViolationReportingTest) {
    ASSERT_TRUE(policy_engine->initialize());
    
    size_t initial_violations = policy_engine->getViolationCount();
    
    policy_engine->reportViolation(
        "test_policy",
        "test_violation",
        PolicyLevel::MEDIUM,
        "Test violation for unit testing"
    );
    
    EXPECT_EQ(policy_engine->getViolationCount(), initial_violations + 1);
}

TEST_F(PolicyEngineTest, EmergencyLockdownTest) {
    ASSERT_TRUE(policy_engine->initialize());
    
    size_t initial_active = policy_engine->getActivePolicyCount();
    
    policy_engine->emergencyLockdown();
    
    // After lockdown, only critical policies should be active
    size_t post_lockdown_active = policy_engine->getActivePolicyCount();
    EXPECT_LE(post_lockdown_active, initial_active);
}

TEST_F(PolicyEngineTest, PolicyManagementTest) {
    ASSERT_TRUE(policy_engine->initialize());
    
    // Create test policy
    auto test_policy = std::make_unique<Policy>(
        "test_policy_001",
        "Test Policy",
        "Policy for unit testing",
        PolicyLevel::LOW
    );
    
    std::string policy_id = test_policy->id;
    
    // Add policy
    EXPECT_TRUE(policy_engine->addPolicy(std::move(test_policy)));
    
    // Check if policy is active
    auto active_policies = policy_engine->getActivePolicyIds();
    EXPECT_TRUE(std::find(active_policies.begin(), active_policies.end(), policy_id) != active_policies.end());
    
    // Remove policy
    EXPECT_TRUE(policy_engine->removePolicy(policy_id));
}

TEST_F(PolicyEngineTest, EnforcementToggleTest) {
    ASSERT_TRUE(policy_engine->initialize());
    
    EXPECT_TRUE(policy_engine->isEnforcementActive());
    
    policy_engine->disableEnforcement();
    EXPECT_FALSE(policy_engine->isEnforcementActive());
    
    policy_engine->enableEnforcement();
    EXPECT_TRUE(policy_engine->isEnforcementActive());
}

// Test fixture for reinforcement learning
class ReinforcementLearningTest : public ::testing::Test {
protected:
    void SetUp() override {
        rl_engine = std::make_unique<ReinforcementLearningEngine>(4, 2, 64, 0.01);
    }
    
    void TearDown() override {
        if (rl_engine) {
            rl_engine->shutdown();
        }
    }
    
    std::unique_ptr<ReinforcementLearningEngine> rl_engine;
};

TEST_F(ReinforcementLearningTest, InitializationTest) {
    EXPECT_TRUE(rl_engine->initialize());
    EXPECT_EQ(rl_engine->getTotalSteps(), 0);
    EXPECT_EQ(rl_engine->getTotalEpisodes(), 0);
}

TEST_F(ReinforcementLearningTest, ActionSelectionTest) {
    ASSERT_TRUE(rl_engine->initialize());
    
    // Create test state
    std::vector<double> features = {0.5, 0.3, 0.8, 0.2};
    State test_state(features, "test_state");
    
    // Get action
    Action action = rl_engine->getAction(test_state);
    
    EXPECT_FALSE(action.action_id.empty());
    EXPECT_FALSE(action.parameters.empty());
}

TEST_F(ReinforcementLearningTest, ExperienceStorageTest) {
    ASSERT_TRUE(rl_engine->initialize());
    
    // Create test experience
    std::vector<double> features = {0.5, 0.3, 0.8, 0.2};
    State state(features, "state1");
    State next_state(features, "state2");
    Action action("test_action", {1.0});
    
    // Store experience
    rl_engine->storeExperience(state, action, 0.5, next_state, false);
    
    // Learning should not crash
    rl_engine->learn();
    
    EXPECT_GT(rl_engine->getTotalSteps(), 0);
}

TEST_F(ReinforcementLearningTest, EpisodeManagementTest) {
    ASSERT_TRUE(rl_engine->initialize());
    
    size_t initial_episodes = rl_engine->getTotalEpisodes();
    
    rl_engine->startEpisode();
    EXPECT_EQ(rl_engine->getTotalEpisodes(), initial_episodes + 1);
    
    rl_engine->endEpisode(10.5);
    // Episode count should remain the same after ending
    EXPECT_EQ(rl_engine->getTotalEpisodes(), initial_episodes + 1);
}

TEST_F(ReinforcementLearningTest, EmergencyStopTest) {
    ASSERT_TRUE(rl_engine->initialize());
    
    // Set some exploration rate
    rl_engine->setExplorationRate(0.5);
    
    // Trigger emergency stop
    rl_engine->emergencyStop();
    
    // Exploration rate should be reset to maximum (safest)
    EXPECT_EQ(rl_engine->getCurrentExplorationRate(), 1.0);
}

// Main test runner
int main(int argc, char** argv) {
    std::cout << "🧪 Running EVA-OFO-001 C++ Test Suite..." << std::endl;
    
    ::testing::InitGoogleTest(&argc, argv);
    
    int result = RUN_ALL_TESTS();
    
    if (result == 0) {
        std::cout << "✅ All C++ tests passed!" << std::endl;
    } else {
        std::cout << "❌ Some C++ tests failed!" << std::endl;
    }
    
    return result;
}