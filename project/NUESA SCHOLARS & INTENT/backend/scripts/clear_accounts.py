"""
Script to delete all user accounts and related data from the database.

USAGE:
  python3 scripts/clear_accounts.py --yes

This script performs deletions in a safe order to avoid foreign key errors:
  1. Delete `applications`
  2. Delete `saved_opportunities`
  3. Delete `opportunity_ratings`
  4. Delete `notifications`
  5. Delete `user_profiles`
  6. Delete `users`

It will print a summary of how many rows were removed per table.

CAUTION: This is destructive. Back up your database before running.
"""

import argparse
from database import SessionLocal, engine
from sqlalchemy import text

TABLES_ORDER = [
    "applications",
    "saved_opportunities",
    "opportunity_ratings",
    "notifications",
    "user_profiles",
    "users",
]

def confirm(prompt: str) -> bool:
    resp = input(f"{prompt} [y/N]: ").strip().lower()
    return resp in ("y", "yes")

def clear_accounts(dry_run: bool = True):
    results = {}
    with SessionLocal() as db:
        trans = db.begin()
        try:
            for tbl in TABLES_ORDER:
                # Count rows referencing users (or all rows for tables that are user-specific)
                if tbl == 'saved_opportunities':
                    # saved_opportunities entries referencing any user
                    count_sql = text(f"SELECT COUNT(*) FROM {tbl}")
                elif tbl == 'opportunity_ratings':
                    count_sql = text(f"SELECT COUNT(*) FROM {tbl}")
                else:
                    count_sql = text(f"SELECT COUNT(*) FROM {tbl}")

                count = db.execute(count_sql).scalar() or 0
                results[tbl] = int(count)

                if not dry_run:
                    delete_sql = text(f"DELETE FROM {tbl}")
                    db.execute(delete_sql)

            if dry_run:
                trans.rollback()
            else:
                trans.commit()

        except Exception as e:
            trans.rollback()
            raise

    return results

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Clear all user accounts and related data.')
    parser.add_argument('--yes', action='store_true', help='Proceed without interactive confirmation')
    parser.add_argument('--execute', action='store_true', help='Actually perform deletions (default is dry-run)')
    args = parser.parse_args()

    print('This script will remove ALL user accounts and related data from the database.')
    print('It is destructive and irreversible. Please ensure you have a backup.')

    if not args.yes:
        ok = confirm('Are you sure you want to continue?')
        if not ok:
            print('Aborted by user.')
            exit(0)

    dry_run = not args.execute
    print(f"Running in {'DRY-RUN' if dry_run else 'EXECUTE'} mode...")

    try:
        res = clear_accounts(dry_run=dry_run)
        print('\nSummary (rows present before deletion):')
        for tbl, cnt in res.items():
            print(f" - {tbl}: {cnt}")

        if dry_run:
            print('\nDry-run complete. To actually delete the rows, re-run with:')
            print('  python3 scripts/clear_accounts.py --yes --execute')
        else:
            print('\nDeletion complete.')
    except Exception as e:
        print(f'Error while clearing accounts: {e}')
        raise
