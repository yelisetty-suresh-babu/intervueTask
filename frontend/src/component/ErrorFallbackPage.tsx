/* eslint-disable @typescript-eslint/no-explicit-any */
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Button, Result } from "antd";

function ErrorFallbackPage({ error, resetErrorBoundary }: any) {
  console.log("Error ===", error);
  return (
    <div
      data-cy="error-message-locator"
      className="flex items-center justify-center w-full h-screen"
    >
      <Result
        icon={<ExclamationCircleOutlined />}
        title="Whoops! Something went wrong"
        subTitle="Please either refresh the page or return home to try again."
        extra={[
          <Button
            type="primary"
            onClick={() => {
              window.location.href = "/";
              resetErrorBoundary();
            }}
            className="!bg-gradient-to-r !from-[#7765DA] !to-[#4F0DCE]"
          >
            Go Home
          </Button>,
        ]}
      />
    </div>
  );
}

export default ErrorFallbackPage;
