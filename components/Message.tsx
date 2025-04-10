const sendTextToApi = async (text: string) => {
  try {
    const response = await fetch('/api/reg-expand', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });
    const data = await response.json();
    console.log('Response from API:', data);
  } catch (error) {
    console.error('Error sending text to API:', error);
  }
};

const handleDragEnd = (event: React.DragEvent<HTMLDivElement>) => {
  const selectedText = window.getSelection()?.toString();
  if (selectedText) {
    sendTextToApi(selectedText);
  }
};

return (
  <div
    draggable={true}
    onDragEnd={handleDragEnd}
    className="p-4 bg-gray-100 rounded-md shadow-md"
  >
    {content}
  </div>
); 