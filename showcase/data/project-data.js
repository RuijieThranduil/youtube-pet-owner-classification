window.PROJECT_DATA = {
  meta: {
    label: "Applied ML case study",
    title: "From noisy comments to defensible audience intelligence.",
    summary:
      "A weakly supervised PySpark NLP pipeline that identifies likely cat and dog owners from unlabeled YouTube comments, then validates the signal against human judgment.",
    stack: ["PySpark 4.1", "Weak supervision", "NLP", "Human validation"],
  },
  highlights: [
    { value: "5.8M", label: "raw comments processed", note: "distributed data preparation" },
    { value: "300", label: "human-reviewed comments", note: "held-out gold set" },
    { value: "0.704", label: "gold-set AUC-PR", note: "final credibility check" },
    { value: "6.1%", label: "users identified", note: "threshold 0.5 · modeling sample" },
  ],
  decision: {
    value: "6.1%",
    label: "of distinct users were identified as likely pet owners",
    context:
      "A focused audience signal identified at a 0.5 decision threshold within the one-million-comment modeling sample.",
    counts: [
      { label: "Distinct users", value: "687,598" },
      { label: "Rule-confirmed", value: "8,977" },
      { label: "Model-identified", value: "32,779" },
    ],
  },
  story: [
    {
      number: "01",
      short: "Frame",
      title: "Find an ownership signal without labels",
      summary:
        "The source data contains comments, user IDs, and creator names—but no pet-ownership target.",
      implementation: "5,819,470 raw comments → clean, de-duplicate, tokenize",
      judgment: "Treat the task as a measurement problem before treating it as a modeling problem.",
    },
    {
      number: "02",
      short: "Label",
      title: "Construct weak labels from explicit language",
      summary:
        "First-person phrases such as “my dog” and “I have a puppy” create high-confidence positive examples.",
      implementation: "Rule-derived positives + sampled weak negatives",
      judgment: "A scalable starting signal, with human review reserved for final validation.",
    },
    {
      number: "03",
      short: "Protect",
      title: "Remove the shortcut before training",
      summary:
        "Trigger words used for labeling are masked so the classifier must learn surrounding context instead of memorizing the rule.",
      implementation: "Leakage mask → TF-IDF and Word2Vec feature views",
      judgment: "Context features test whether the signal generalizes beyond the trigger phrases.",
    },
    {
      number: "04",
      short: "Compare",
      title: "Select models with imbalance-aware metrics",
      summary:
        "Logistic regression, weighted loss, TF-IDF, Word2Vec, and random forest are compared with three-fold cross-validation.",
      implementation: "Optimize AUC-PR · compare precision/recall trade-offs",
      judgment: "The stronger TF-IDF baseline becomes the leading candidate for validation.",
    },
    {
      number: "05",
      short: "Validate",
      title: "Check the signal against human judgment",
      summary:
        "A manually labeled 300-comment gold set separates real predictive value from agreement with the labeling rules.",
      implementation: "Gold-set AUC-PR 0.704 · F1 0.655",
      judgment: "Human review anchors performance to the real classification task.",
    },
    {
      number: "06",
      short: "Aggregate",
      title: "Move from comment predictions to people",
      summary:
        "Comment probabilities are averaged by user ID, then de-duplicated against rule-confirmed owners.",
      implementation: "Many comments → one probability per distinct user",
      judgment: "The final output becomes an audience-level signal that decision-makers can use.",
    },
  ],
  models: [
    { name: "TF-IDF + Logistic Regression", aucPr: 0.821, f1: 0.681, selected: true },
    { name: "Tuned Word2Vec + Logistic Regression", aucPr: 0.770, f1: 0.705 },
    { name: "Weighted Word2Vec + Logistic Regression", aucPr: 0.752, f1: 0.709 },
    { name: "Word2Vec + Random Forest", aucPr: 0.748, f1: 0.582 },
    { name: "Untuned Word2Vec + Logistic Regression", aucPr: 0.591, f1: 0.005 },
  ],
  gold: {
    sampleSize: 300,
    metrics: [
      { label: "AUC-PR", value: "0.704" },
      { label: "AUC-ROC", value: "0.812" },
      { label: "Precision", value: "0.644" },
      { label: "Recall", value: "0.667" },
      { label: "F1", value: "0.655" },
    ],
    confusion: [
      { key: "tp", label: "True positive", value: 76 },
      { key: "fp", label: "False positive", value: 42 },
      { key: "fn", label: "False negative", value: 38 },
      { key: "tn", label: "True negative", value: 144 },
    ],
  },
  guardrails: [
    {
      title: "Label leakage",
      body: "Ownership trigger tokens are removed before feature learning.",
    },
    {
      title: "Class imbalance",
      body: "AUC-PR, downsampling, and weighted loss replace accuracy-only evaluation.",
    },
    {
      title: "Validation hierarchy",
      body: "Human gold-set results are reported separately from weak-label model selection.",
    },
    {
      title: "User-level consistency",
      body: "Comment probabilities are aggregated and counted once per distinct user.",
    },
  ],
  roadmap: [
    "Calibrate the audience estimate across decision thresholds before using it for campaign sizing.",
    "Expand human labeling to strengthen negative examples and support probability calibration.",
    "Adopt a group split by user ID to measure generalization to entirely unseen users.",
    "Package tokenization and feature fitting in a train-only pipeline for production deployment.",
  ],
  links: {
    notebook: "../youtube_pet_owner_classification.ipynb",
    repository: "https://github.com/RuijieThranduil/youtube-pet-owner-classification",
    email: "mailto:ruijiema944@gmail.com",
  },
};
