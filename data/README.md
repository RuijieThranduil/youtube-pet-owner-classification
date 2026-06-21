# Data contract

The raw dataset is approximately 647 MB and contains user-level social-media records.

The dataset is not distributed publicly due to confidentiality restrictions. For data-access questions, contact [ruijiema944@gmail.com](mailto:ruijiema944@gmail.com).

Place the source file at `animals_comments/animals_comments.csv` before running the notebook.

## Expected schema

| Column | Type | Description |
|---|---|---|
| `creator_name` | string | YouTube channel or creator associated with the comment |
| `userid` | numeric/string identifier | Anonymous user identifier used for user-level aggregation |
| `comment` | string | Raw YouTube comment text |

The notebook reads quoted multiline CSV records, removes rows without comments or user IDs, de-duplicates records, and lowercases text before labeling and feature engineering.

## Human-labeled evaluation files

The notebook can generate `gold_to_label.csv`, which is manually completed and saved as `gold_labeled.csv`. Both files are ignored by Git to avoid publishing user-level text and identifiers.

