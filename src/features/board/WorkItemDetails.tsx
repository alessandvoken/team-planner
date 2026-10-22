import { Card, Modal } from '@heroui/react';
import type { WorkItem } from './types';

type WorkItemDetailsProps = {
  item: WorkItem;
};

export function WorkItemDetails({ item }: WorkItemDetailsProps) {
  return (
    <Modal>
      <Modal.Trigger className="w-full">
        <Card className="ring-1 ring-transparent hover:ring-accent focus-within:ring-accent">
          <Card.Header>
            <Card.Description className="text-xs">#{item.id}</Card.Description>
            <Card.Title className="font-normal">{item.title}</Card.Title>
          </Card.Header>
        </Card>
      </Modal.Trigger>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>{item.title}</Modal.Heading>
            </Modal.Header>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
