# Identifying Pet Owners from 5.8M YouTube Comments

> A weakly supervised NLP pipeline built with PySpark to infer pet ownership from unlabeled social-media text, validate predictions against a human-labeled gold set, and translate model outputs into audience insights.

## Why this project matters

YouTube creators and brands can observe engagement, but they rarely know who is behind it. This project asks a practical audience-intelligence question:

**Can language in public comments reveal which viewers are likely cat or dog owners—even when no ground-truth labels exist?**

The hard part is not fitting a classifier. It is creating defensible labels, preventing the model from memorizing those labeling rules, evaluating against real human judgments, and converting comment-level predictions into user-level estimates.

## Project at a glance

| Item | Result |
|---|---:|
| Raw comments processed | 5,819,470 |
| Modeling sample | 1,000,000 comments |
| Distinct users in sample | 687,598 |
| Hand-labeled evaluation set | 300 comments |
| Final gold-set AUC-PR | **0.704** |
| Final gold-set F1 | **0.655** |
| Estimated pet-owner share in sample | **6.1%** |

The 6.1% estimate is calculated at the **distinct-user level**: rule-confirmed owners and additional model-predicted owners are de-duplicated before division by all sampled users.

## The analytical story

```mermaid
flowchart LR
    A["5.8M raw comments"] --> B["Clean and tokenize"]
    B --> C["Create weak labels from ownership language"]
    C --> D["Mask labeling terms to prevent leakage"]
    D --> E["Word2Vec and TF-IDF features"]
    E --> F["LR / weighted LR / Random Forest"]
    F --> G["Cross-validation on AUC-PR"]
    G --> H["Human-labeled gold-set check"]
    H --> I["Aggregate probabilities by user"]
    I --> J["Audience and topic insights"]
```

### 1. Turning an unlabeled dataset into a supervised problem

The dataset contains comments, user IDs, and creator names—but no ownership label. I used explicit first-person phrases such as `my dog`, `my cat`, and `I have a puppy` to create high-confidence positive labels. The remaining data is treated as weakly labeled or unknown rather than unquestioned ground truth.

### 2. Preventing label leakage

A model trained on the same phrases used to generate labels could report excellent metrics simply by rediscovering the rule. To reduce this leakage, ownership trigger tokens are removed before feature learning. The model must instead use surrounding context such as veterinary care, feeding, training, rescue, and household language.

### 3. Comparing models, not assuming complexity wins

I compared Word2Vec and TF-IDF representations across logistic regression, class weighting, cross-validation, and random forest models.

| Model | Test AUC-PR | Test F1 |
|---|---:|---:|
| Untuned Word2Vec + Logistic Regression | 0.591 | 0.005 |
| Tuned Word2Vec + Logistic Regression | 0.770 | 0.705 |
| Weighted Word2Vec + Logistic Regression | 0.752 | 0.709 |
| TF-IDF + Logistic Regression | **0.821** | 0.681 |
| Word2Vec + Random Forest | 0.748 | 0.582 |

These test metrics use weak labels and therefore measure agreement with the labeling strategy. They are useful for model comparison, but they are not the final claim.

### 4. Checking the model against human judgment

I manually labeled a 300-comment gold set sampled from both unknown and rule-positive cases. On this more trustworthy evaluation set, the selected tuned logistic regression achieved:

- **AUC-PR: 0.704**
- **AUC-ROC: 0.812**
- **F1: 0.655**
- **Precision: 0.644**
- **Recall: 0.667**

The drop from weak-label validation to gold-set performance is expected—and is precisely why the second evaluation layer matters.

### 5. Moving from comments to people

The classifier produces one probability per comment. For audience estimates, I average probabilities across each user's comments, assign one prediction per distinct user, and de-duplicate users already identified by the labeling rules. This avoids treating a prolific commenter as multiple people.

## Technical stack

- **Distributed processing:** PySpark 4.1
- **NLP:** RegexTokenizer, StopWordsRemover, Word2Vec, HashingTF, IDF, LDA
- **Models:** Logistic Regression, weighted Logistic Regression, Random Forest
- **Model selection:** 3-fold cross-validation optimized for AUC-PR
- **Evaluation:** precision, recall, F1, AUC-ROC, AUC-PR, human-labeled gold set
- **Visualization:** Matplotlib, WordCloud

## Repository structure

```text
.
├── README.md
├── youtube_pet_owner_classification.ipynb
├── requirements.txt
├── data/
│   └── README.md
└── .gitignore
```

Raw comments, user-level labeling files, and local notebook backups are intentionally excluded from version control.

## Run locally

Requirements: Python 3.11+, Java 17, and at least 16 GB RAM recommended.

```bash
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
jupyter notebook youtube_pet_owner_classification.ipynb
```

Place the source CSV at:

```text
animals_comments/animals_comments.csv
```

Expected columns are documented in [`data/README.md`](data/README.md). The notebook uses a one-million-row modeling sample by default so the full workflow can run on a local machine.

## Limitations and next steps

- Weak negative labels are noisy: absence of ownership language is not proof that a user does not own a pet.
- The current train/test split is comment-level; a group split by `userid` would provide a stricter estimate of generalization to unseen users.
- Word2Vec is fit before the supervised split. A production pipeline should fit every learned transformation using training data only.
- TF-IDF leads on weak-label AUC-PR; the next iteration should compare it with Word2Vec on the same gold set before final model selection.
- Creator ranking should use distinct predicted-owner users per creator rather than raw owner-attributed comment volume.

## What this project demonstrates

This is not just a text-classification notebook. It demonstrates how I approach an ambiguous DS problem: define a measurable target, construct labels carefully, challenge leakage, choose metrics for imbalance, validate with human judgment, and keep the final business statistic aligned with the unit of analysis.

