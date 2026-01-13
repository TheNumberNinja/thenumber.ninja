import Uppy from '@uppy/core';
import Dashboard from '@uppy/dashboard';
import AwsS3 from '@uppy/aws-s3';

import '@uppy/core/css/style.min.css';
import '@uppy/dashboard/css/style.min.css';

(function () {
  'use strict';

  const config = window.uploadConfig || {};

  const BLOCKED_EXTENSIONS = [
    '.exe', '.bat', '.cmd', '.com', '.msi', '.scr', '.pif',
    '.js', '.vbs', '.vbe', '.jse', '.ws', '.wsf', '.ps1',
    '.sh', '.bash',
    '.jar', '.jnlp',
    '.php', '.asp', '.aspx', '.jsp', '.hta',
    '.lnk', '.url',
    '.reg',
  ];

  const MAX_NOTE_LENGTH = 500;

  function getExtension(filename) {
    const lastDot = filename.lastIndexOf('.');
    return lastDot !== -1 ? filename.slice(lastDot).toLowerCase() : '';
  }

  function isBlockedExtension(filename) {
    const ext = getExtension(filename);
    return BLOCKED_EXTENSIONS.includes(ext);
  }

  function showSuccess(message) {
    Swal.fire({
      icon: 'success',
      title: 'Upload Complete',
      text: message,
    });
  }

  function showError(message) {
    Swal.fire({
      icon: 'error',
      title: 'Upload Error',
      text: message,
    });
  }

  let batchId = null;

  function getBatchId() {
    if (!batchId) {
      batchId = crypto.randomUUID();
    }
    return batchId;
  }

  function resetBatchId() {
    batchId = null;
  }

  const uppy = new Uppy({
    restrictions: {
      maxFileSize: 50 * 1024 * 1024, // 50MB
    },
    onBeforeFileAdded: (currentFile) => {
      if (isBlockedExtension(currentFile.name)) {
        const ext = getExtension(currentFile.name);
        uppy.info(`File type ${ext} is not allowed`, 'error', 3000);
        return false;
      }
      return true;
    },
  });

  uppy.use(Dashboard, {
    inline: true,
    target: '#uppy-dashboard',
    height: 450,
    width: '100%',
    showProgressDetails: true,
    proudlyDisplayPoweredByUppy: false,
    metaFields: [
      {
        id: 'note',
        name: 'Note (optional)',
        placeholder: 'Add a note about this file...',
        render: ({ value, onChange }, h) => {
          return h('div', {}, [
            h('textarea', {
              class: 'note-field',
              rows: 3,
              maxLength: MAX_NOTE_LENGTH,
              value: value || '',
              onInput: (ev) => {
                const newValue = ev.target.value;
                if (newValue.length <= MAX_NOTE_LENGTH) {
                  onChange(newValue);
                }
              },
              placeholder: 'Add a note about this file...',
            }),
            h('div', {
              class: `note-counter ${(value?.length || 0) > MAX_NOTE_LENGTH - 50 ? 'warning' : ''}`,
            }, `${value?.length || 0}/${MAX_NOTE_LENGTH}`),
          ]);
        },
      },
    ],
  });

  uppy.use(AwsS3, {
    async getUploadParameters(file) {
      const response = await fetch('/.netlify/functions/sign-upload-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: config.clientId,
          batchId: getBatchId(),
          filename: file.name,
          contentType: file.type || 'application/octet-stream',
          note: file.meta.note || '',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get upload URL');
      }

      const data = await response.json();
      return {
        method: data.method,
        url: data.url,
        headers: data.headers,
      };
    },
  });

  uppy.on('complete', (result) => {
    if (result.failed.length === 0) {
      showSuccess(`${result.successful.length} file(s) uploaded successfully.`);
      resetBatchId();
    } else if (result.successful.length > 0) {
      showError(`${result.successful.length} file(s) uploaded, but ${result.failed.length} failed.`);
    } else {
      showError('Upload failed. Please try again.');
    }
  });

  uppy.on('upload-error', (file, error) => {
    console.error('Upload error for', file.name, error);
  });

  uppy.on('error', (error) => {
    console.error('Uppy error:', error);
    showError(error.message || 'An unexpected error occurred.');
  });
})();
