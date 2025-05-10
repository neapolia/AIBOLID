import { getStorageAnalytics } from '@/app/lib/storage-analytics';
import StorageAnalyticsClient from './storage-analytics-client';

export default async function StorageAnalyticsPage() {
  const analytics = await getStorageAnalytics();

  return <StorageAnalyticsClient analytics={analytics} />;
} 