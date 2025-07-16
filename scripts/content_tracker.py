#!/usr/bin/env python3
"""
Content tracker for legal references - handles checksum generation and change detection.
"""

import hashlib
import json
import os
from datetime import datetime
from typing import Dict, List, Tuple, Optional

class ContentTracker:
    def __init__(self, history_file: str = "content_history.json"):
        self.history_file = history_file
        self.history = self._load_history()
    
    def _load_history(self) -> Dict:
        """Load content history from file."""
        if os.path.exists(self.history_file):
            try:
                with open(self.history_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except:
                return {}
        return {}
    
    def _save_history(self):
        """Save content history to file."""
        with open(self.history_file, 'w', encoding='utf-8') as f:
            json.dump(self.history, f, ensure_ascii=False, indent=2)
    
    def generate_checksum(self, content: str) -> str:
        """Generate SHA-256 checksum for content."""
        return hashlib.sha256(content.encode('utf-8')).hexdigest()
    
    def get_article_key(self, code: str, article: str) -> str:
        """Generate unique key for article."""
        return f"{code}:{article}"
    
    def track_article(self, code: str, article: str, content: str, 
                     title: str = "", source_url: str = "") -> Dict:
        """Track an article and detect changes."""
        key = self.get_article_key(code, article)
        checksum = self.generate_checksum(content)
        now = datetime.utcnow().isoformat() + 'Z'
        
        # Check if article exists in history
        if key in self.history:
            old_checksum = self.history[key].get('checksum', '')
            if old_checksum != checksum:
                # Content has changed
                self.history[key]['previous_checksums'] = self.history[key].get('previous_checksums', [])
                self.history[key]['previous_checksums'].append({
                    'checksum': old_checksum,
                    'lastUpdated': self.history[key].get('lastUpdated', now)
                })
                self.history[key]['checksum'] = checksum
                self.history[key]['lastUpdated'] = now
                self.history[key]['title'] = title
                self.history[key]['sourceUrl'] = source_url
                change_status = 'modified'
            else:
                # No change
                change_status = 'unchanged'
        else:
            # New article
            self.history[key] = {
                'code': code,
                'article': article,
                'title': title,
                'checksum': checksum,
                'firstSeen': now,
                'lastUpdated': now,
                'sourceUrl': source_url,
                'previous_checksums': []
            }
            change_status = 'new'
        
        return {
            'key': key,
            'status': change_status,
            'checksum': checksum,
            'lastUpdated': self.history[key]['lastUpdated']
        }
    
    def detect_changes(self, current_articles: List[Dict]) -> Dict[str, List[Dict]]:
        """Detect changes between current articles and history."""
        changes = {
            'new': [],
            'modified': [],
            'unchanged': [],
            'removed': []
        }
        
        # Track current article keys
        current_keys = set()
        
        for article in current_articles:
            key = self.get_article_key(article['code'], article['article'])
            current_keys.add(key)
            
            result = self.track_article(
                code=article['code'],
                article=article['article'],
                content=article['content'],
                title=article.get('title', ''),
                source_url=article.get('sourceUrl', '')
            )
            
            article_info = {
                'code': article['code'],
                'article': article['article'],
                'title': article.get('title', ''),
                'checksum': result['checksum'],
                'lastUpdated': result['lastUpdated']
            }
            
            changes[result['status']].append(article_info)
        
        # Check for removed articles
        for key in self.history:
            if key not in current_keys:
                parts = key.split(':', 1)
                if len(parts) == 2:
                    changes['removed'].append({
                        'code': parts[0],
                        'article': parts[1],
                        'title': self.history[key].get('title', ''),
                        'lastSeen': self.history[key].get('lastUpdated', '')
                    })
        
        # Save updated history
        self._save_history()
        
        return changes
    
    def get_article_history(self, code: str, article: str) -> Optional[Dict]:
        """Get history for a specific article."""
        key = self.get_article_key(code, article)
        return self.history.get(key)
    
    def generate_change_report(self, changes: Dict[str, List[Dict]]) -> str:
        """Generate a human-readable change report."""
        report = []
        report.append(f"Content Change Report - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append("=" * 60)
        
        if changes['new']:
            report.append(f"\nNew Articles ({len(changes['new'])}):")
            for article in changes['new']:
                report.append(f"  - {article['code']} {article['article']}: {article['title']}")
        
        if changes['modified']:
            report.append(f"\nModified Articles ({len(changes['modified'])}):")
            for article in changes['modified']:
                report.append(f"  - {article['code']} {article['article']}: {article['title']}")
        
        if changes['removed']:
            report.append(f"\nRemoved Articles ({len(changes['removed'])}):")
            for article in changes['removed']:
                report.append(f"  - {article['code']} {article['article']}: {article['title']}")
        
        report.append(f"\nUnchanged Articles: {len(changes['unchanged'])}")
        report.append(f"Total Articles Tracked: {len(self.history)}")
        
        return '\n'.join(report)